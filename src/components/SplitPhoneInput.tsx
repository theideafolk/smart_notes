import React from 'react';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import { ChevronDown } from 'lucide-react';

type CountryCode = ReturnType<typeof getCountries>[number];

interface SplitPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const SplitPhoneInput: React.FC<SplitPhoneInputProps> = ({ 
  value, 
  onChange, 
  className = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>('IN');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  // Parse the initial value only once when the component mounts or value changes
  React.useEffect(() => {
    if (value) {
      const countryCode = value.split(' ')[0].replace('+', '');
      const country = getCountries().find(c => getCountryCallingCode(c) === countryCode) as CountryCode || 'IN';
      setSelectedCountry(country);
      setPhoneNumber(value.replace(`+${countryCode} `, ''));
    }
  }, [value]);

  // Update parent only when phone number or country changes
  React.useEffect(() => {
    const countryCode = getCountryCallingCode(selectedCountry);
    const newValue = `+${countryCode} ${phoneNumber}`;
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [selectedCountry, phoneNumber]);

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>+{getCountryCallingCode(selectedCountry)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {getCountries().map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => {
                  setSelectedCountry(country as CountryCode);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  selectedCountry === country ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇺🇸</span>
                  <span>+{getCountryCallingCode(country as CountryCode)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => !disabled && setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
        disabled={disabled}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default SplitPhoneInput; 