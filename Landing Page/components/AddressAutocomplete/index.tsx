import React, { useRef, useEffect } from 'react';
import cn from 'classnames';
import styles from './AddressAutocomplete.module.sass';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    placeholder?: string;
    error?: string;
    className?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    className
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);

    useEffect(() => {
        if (!window.google || !inputRef.current) return;

        const options = {
            fields: ['address_components', 'formatted_address'],
            types: ['address']
        };

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            options
        );

        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                onChange(place.formatted_address);
            }
        });

        return () => {
            if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, []);

    return (
        <div className={cn(styles.container, className)}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                className={cn(styles.input, { [styles.error]: error })}
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

export default AddressAutocomplete; 