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
    const [predictions, setPredictions] = useState<any[]>([]);
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

    const getPlaceDetails = async (placeId: string) => {
        if (!isScriptLoaded) return null;

        try {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            return new Promise((resolve, reject) => {
                service.getDetails({ placeId, fields: ['address_components', 'formatted_address'] }, (place: any, status: string) => {
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
                const request = {
                    input: newValue,
                    types: type === 'jurisdiction' ? ['(regions)'] : ['address'],
                    componentRestrictions: { country: [] }
                };

                const results = await autocompleteServiceRef.current.getPlacePredictions(request);
                setPredictions(results.predictions || []);
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

    const handlePredictionClick = async (prediction: any) => {
        if (!isScriptLoaded) return;

        try {
            const place = await getPlaceDetails(prediction.place_id);
            if (place) {
            if (type === 'jurisdiction') {
                const addressComponents = place.address_components || [];
                    const getComponent = (type: string) => {
                        const component = addressComponents.find(
                            (comp: any) => comp.types.includes(type)
                        );
                        return component ? component.long_name : '';
                    };

                    const city = getComponent('locality') || getComponent('administrative_area_level_2');
                    const state = getComponent('administrative_area_level_1');
                    const country = getComponent('country');

                    let jurisdiction = '';
                    if (city) jurisdiction += city;
                    if (state) jurisdiction += (jurisdiction ? ', ' : '') + state;
                    if (country) jurisdiction += (jurisdiction ? ', ' : '') + country;

                    if (!jurisdiction && place.formatted_address) {
                        jurisdiction = place.formatted_address;
                    }

                    setInputValue(jurisdiction);
                onChange(jurisdiction);
            } else {
                    setInputValue(place.formatted_address);
                    onChange(place.formatted_address);
                }
            }
        } catch (err) {
            console.error('Error handling prediction click:', err);
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
                            {prediction.description}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete; 