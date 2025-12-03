import { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ALL_ICONS, searchIcons } from '../../constants/icons';
import Input from '../ui/Input';
import './IconPicker.css';

export default function IconPicker({ selectedIcon, onSelect, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = searchIcons(searchQuery);

    const handleIconSelect = (iconId) => {
        onSelect(iconId);
        if (onClose) onClose();
    };

    const renderIcon = (iconId) => {
        // Get the icon component from Lucide
        const iconName = iconId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        const IconComponent = LucideIcons[iconName];

        if (!IconComponent) {
            return <LucideIcons.Circle size={24} />;
        }

        return <IconComponent size={24} />;
    };

    return (
        <div className="icon-picker">
            <div className="icon-picker-header">
                <h3>Choose an Icon</h3>
                {onClose && (
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="icon-picker-search">
                <Input
                    placeholder="Search icons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search size={16} />}
                    fullWidth
                />
            </div>

            <div className="icon-picker-grid">
                {filteredIcons.length > 0 ? (
                    filteredIcons.map((icon) => (
                        <button
                            key={icon.id}
                            className={`icon-option ${selectedIcon === icon.id ? 'selected' : ''}`}
                            onClick={() => handleIconSelect(icon.id)}
                            title={icon.name}
                            type="button"
                        >
                            {renderIcon(icon.id)}
                        </button>
                    ))
                ) : (
                    <div className="no-icons">
                        <p className="text-secondary">No icons found</p>
                    </div>
                )}
            </div>

            <div className="icon-picker-footer">
                <p className="text-tertiary">
                    {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
                </p>
            </div>
        </div>
    );
}
