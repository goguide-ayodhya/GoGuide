import React from 'react'
import { LocationEdit } from 'lucide-react'

const LocationSearchPanel = ({ suggestions, setVehiclePanel, setPanelOpen, setPickup, setDestination, activeField }) => {

    const handleSuggestionClick = (suggestion) => {
        if (activeField === 'pickup') {
            setPickup(suggestion)
        } else if (activeField === 'destination') {
            setDestination(suggestion)
        }
        setPanelOpen(false); // Close the panel after selecting a suggestion
    }

    return (
        <div className="w-full px-2 sm:px-4 pt-4">
            {/* Display fetched suggestions */}
            <div className="space-y-2">
                {suggestions.length > 0 ? (
                    suggestions.map((elem, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleSuggestionClick(elem)} 
                            className='flex gap-3 sm:gap-4 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 p-2.5 sm:p-3 rounded-lg items-center cursor-pointer transition'
                        >
                            <div className='bg-gray-100 h-8 sm:h-10 flex items-center justify-center w-8 sm:w-10 rounded-full flex-shrink-0'>
                                <LocationEdit className='text-gray-600 text-lg sm:text-xl' />
                            </div>
                            <h4 className='font-medium text-sm sm:text-base text-gray-800 truncate'>{elem}</h4>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 text-sm py-4">No suggestions found</p>
                )}
            </div>
        </div>
    )
}

export default LocationSearchPanel