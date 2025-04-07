import React, { useRef, useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './AddressAutocomplete.module.sass';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    placeholder?: string;
    error?: string;
    className?: string;
    type?: 'address' | 'jurisdiction';
}

declare global {
    interface Window {
        google: any;
        initGoogleMaps: () => void;
    }
}

// Add interface for Google Places prediction
interface PlacePrediction {
    description: string;
    place_id: string;
    structured_formatting?: {
        main_text: string;
        secondary_text: string;
    };
    terms?: Array<{
        offset: number;
        value: string;
    }>;
    types?: string[];
}

// Add this interface for the place object
interface PlaceDetails {
    address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    formatted_address?: string;
    geometry?: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
    name?: string;
    vicinity?: string;
    plus_code?: {
        compound_code: string;
        global_code: string;
    };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    className,
    type = 'address'
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteServiceRef = useRef<any>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        // Check if Google Maps script is loaded
        const checkScript = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsScriptLoaded(true);
            } else {
                setTimeout(checkScript, 100);
            }
        };

        // If script is already loaded, set the state
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsScriptLoaded(true);
        } else {
            // Otherwise, start checking
            checkScript();
        }

        // Cleanup
        return () => {
            setIsScriptLoaded(false);
        };
    }, []);

    useEffect(() => {
        if (!isScriptLoaded) return;

        try {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        } catch (err) {
            console.error('Error initializing Google Places Autocomplete Service:', err);
        }
    }, [isScriptLoaded]);

    const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
        if (!isScriptLoaded) return null;

        try {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            return new Promise((resolve, reject) => {
                service.getDetails({ 
                    placeId, 
                    fields: [
                        'address_components', 
                        'formatted_address',
                        'geometry',
                        'name',
                        'vicinity',
                        'plus_code'
                    ] 
                }, (place: any, status: string) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(place);
                    } else {
                        reject(new Error('Place details request failed'));
                    }
                });
            });
        } catch (err) {
            console.error('Error getting place details:', err);
            return null;
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);

        if (!isScriptLoaded || !autocompleteServiceRef.current) {
            console.warn('Google Maps script not loaded or AutocompleteService not initialized');
            return;
        }

        if (newValue.length > 2) {
            try {
                let allPredictions: PlacePrediction[] = [];
                
                // Configure request differently based on type
                if (type === 'jurisdiction') {
                    // For jurisdictions
                    const request = {
                        input: newValue,
                        types: ['(regions)']
                    };
                    const results = await autocompleteServiceRef.current.getPlacePredictions(request);
                    allPredictions = results.predictions || [];
                    
                    // Try additional query for more specific places if first query returns limited results
                    if (allPredictions.length < 3) {
                        try {
                            const cityRequest = {
                                input: newValue,
                                types: ['(cities)']
                            };
                            const cityResults = await autocompleteServiceRef.current.getPlacePredictions(cityRequest);
                            // Combine and deduplicate results
                            const cityPredictions: PlacePrediction[] = cityResults.predictions || [];
                            const existingIds = new Set(allPredictions.map((p: PlacePrediction) => p.place_id));
                            allPredictions = [
                                ...allPredictions, 
                                ...cityPredictions.filter((p: PlacePrediction) => !existingIds.has(p.place_id))
                            ];
                        } catch (e) {
                            // Ignore errors from secondary query
                            console.log('Secondary jurisdiction query failed:', e);
                        }
                        
                        // Try a third query for administrative areas
                        try {
                            const adminRequest = {
                                input: newValue,
                                types: ['geocode'] // This will include administrative areas
                            };
                            const adminResults = await autocompleteServiceRef.current.getPlacePredictions(adminRequest);
                            // Combine and deduplicate results
                            const adminPredictions: PlacePrediction[] = adminResults.predictions || [];
                            const updatedExistingIds = new Set(allPredictions.map((p: PlacePrediction) => p.place_id));
                            allPredictions = [
                                ...allPredictions, 
                                ...adminPredictions.filter((p: PlacePrediction) => !updatedExistingIds.has(p.place_id))
                            ];
                        } catch (e) {
                            // Ignore errors from tertiary query
                            console.log('Tertiary administrative query failed:', e);
                        }
                    }
                } else {
                    // First query - addresses
                    const addressRequest = {
                        input: newValue,
                        types: ['address']
                    };
                    const addressResults = await autocompleteServiceRef.current.getPlacePredictions(addressRequest);
                    allPredictions = addressResults.predictions || [];
                    
                    // Second query - establishments (businesses, points of interest)
                    try {
                        const establishmentRequest = {
                            input: newValue,
                            types: ['establishment']
                        };
                        const establishmentResults = await autocompleteServiceRef.current.getPlacePredictions(establishmentRequest);
                        
                        // Combine and deduplicate results
                        const establishmentPredictions: PlacePrediction[] = establishmentResults.predictions || [];
                        const existingIds = new Set(allPredictions.map((p: PlacePrediction) => p.place_id));
                        allPredictions = [
                            ...allPredictions, 
                            ...establishmentPredictions.filter((p: PlacePrediction) => !existingIds.has(p.place_id))
                        ];
                    } catch (e) {
                        // Ignore errors from secondary query
                        console.log('Secondary establishment query failed:', e);
                    }
                    
                    // Third query - geocode (for localities, cities, etc.)
                    try {
                        const geocodeRequest = {
                            input: newValue,
                            types: ['geocode']
                        };
                        const geocodeResults = await autocompleteServiceRef.current.getPlacePredictions(geocodeRequest);
                        
                        // Combine and deduplicate results
                        const geocodePredictions: PlacePrediction[] = geocodeResults.predictions || [];
                        const updatedExistingIds = new Set(allPredictions.map((p: PlacePrediction) => p.place_id));
                        allPredictions = [
                            ...allPredictions, 
                            ...geocodePredictions.filter((p: PlacePrediction) => !updatedExistingIds.has(p.place_id))
                        ];
                    } catch (e) {
                        // Ignore errors from tertiary query
                        console.log('Tertiary geocode query failed:', e);
                    }
                }
                
                // Limit the number of predictions to display
                const MAX_PREDICTIONS = 10;
                allPredictions = allPredictions.slice(0, MAX_PREDICTIONS);
                
                setPredictions(allPredictions);
                setShowPredictions(true);
            } catch (err) {
                console.error('Error getting predictions:', err);
                setPredictions([]);
            }
        } else {
            setPredictions([]);
            setShowPredictions(false);
        }
    };

    const handlePredictionClick = async (prediction: PlacePrediction) => {
        try {
            const place = await getPlaceDetails(prediction.place_id);
            if (place) {
                if (type === 'jurisdiction') {
                    const addressComponents = place.address_components || [];
                    // Improved component selection prioritizing more specific components
                    const getComponent = (types: string[]) => {
                        for (const type of types) {
                            const component = addressComponents.find(
                                (comp: any) => comp.types.includes(type)
                            );
                            if (component) return component.long_name;
                        }
                        return '';
                    };

                    // Build jurisdiction with more granularity
                    const jurisdiction = [
                        getComponent(['locality', 'sublocality']),
                        getComponent(['administrative_area_level_3']),
                        getComponent(['administrative_area_level_2']),
                        getComponent(['administrative_area_level_1']),
                        getComponent(['country'])
                    ].filter(Boolean).join(', ');

                    if (jurisdiction) {
                        setInputValue(jurisdiction);
                        onChange(jurisdiction);
                    } else {
                        // Fallback to Google's full formatted address if components approach fails
                        setInputValue(prediction.description);
                        onChange(prediction.description);
                    }
                } else {
                    // For addresses, use the full formatted address from Google
                    const formattedAddress = place.formatted_address || prediction.description || '';
                    setInputValue(formattedAddress);
                    onChange(formattedAddress);
                }
            } else {
                // Fallback if place details API fails
                setInputValue(prediction.description);
                onChange(prediction.description);
            }
        } catch (error) {
            console.error('Error getting place details:', error);
            // Fallback to prediction description on error
            setInputValue(prediction.description);
            onChange(prediction.description);
        }
        setShowPredictions(false);
    };

    return (
        <div className={cn(styles.container, className)}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={() => {
                    setTimeout(() => setShowPredictions(false), 200);
                    onBlur();
                }}
                placeholder={placeholder}
                className={cn(styles.input, { [styles.error]: error })}
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
            {showPredictions && predictions.length > 0 && (
                <div className={styles.predictions}>
                    {predictions.map((prediction) => (
                        <div
                            key={prediction.place_id}
                            className={styles.predictionItem}
                            onClick={() => handlePredictionClick(prediction)}
                        >
                            <div className={styles.mainDescription}>
                                {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                            </div>
                            {prediction.structured_formatting?.secondary_text && (
                                <div className={styles.secondaryDescription}>
                                    {prediction.structured_formatting.secondary_text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete; 