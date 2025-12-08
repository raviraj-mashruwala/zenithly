import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Search, X } from 'lucide-react';
import Input from '../ui/Input';
import './AvatarIconPicker.css';

// Popular icon sets with commonly used icons
const ICON_SETS = [
    {
        name: 'Material Design',
        prefix: 'mdi',
        icons: [
            'account-circle', 'account', 'emoticon-happy', 'emoticon-cool', 'emoticon-excited',
            'face-man', 'face-woman', 'account-cowboy-hat', 'alien', 'cat', 'dog', 'penguin',
            'owl', 'panda', 'robot', 'ghost', 'ninja', 'pirate', 'star-face', 'ufo',
            'rocket', 'lightning-bolt', 'fire', 'leaf', 'flower', 'tree', 'moon-waning-crescent',
            'star', 'heart', 'diamond', 'crown', 'trophy', 'medal', 'gamepad-variant'
        ]
    },
    {
        name: 'Fluent',
        prefix: 'fluent',
        icons: [
            'person-24-filled', 'person-circle-24-filled', 'emoji-smile-slight-24-filled',
            'emoji-laugh-24-filled', 'emoji-sparkle-24-filled', 'animal-cat-24-filled',
            'animal-dog-24-filled', 'animal-rabbit-24-filled', 'animal-turtle-24-filled',
            'bot-24-filled', 'rocket-24-filled', 'star-24-filled', 'heart-24-filled',
            'diamond-24-filled', 'crown-24-filled', 'trophy-24-filled', 'flash-24-filled',
            'leaf-one-24-filled', 'weather-moon-24-filled', 'sparkle-24-filled'
        ]
    },
    {
        name: 'Phosphor',
        prefix: 'ph',
        icons: [
            'user-circle-fill', 'user-fill', 'smiley-fill', 'smiley-wink-fill', 'smiley-sticker-fill',
            'alien-fill', 'cat-fill', 'dog-fill', 'bird-fill', 'fish-fill', 'butterfly-fill',
            'ghost-fill', 'robot-fill', 'skull-fill', 'star-fill', 'heart-fill', 'diamond-fill',
            'crown-simple-fill', 'trophy-fill', 'lightning-fill', 'rocket-fill', 'moon-fill',
            'sun-fill', 'flower-fill', 'tree-fill', 'cactus-fill', 'fire-fill', 'flame-fill'
        ]
    },
    {
        name: 'Carbon',
        prefix: 'carbon',
        icons: [
            'user-avatar-filled', 'user-filled', 'face-satisfied-filled', 'face-wink-filled',
            'face-cool', 'bot', 'bee', 'fish', 'star-filled', 'favorite-filled',
            'diamond', 'crown', 'trophy', 'flash', 'rocket', 'moon', 'sun', 'partly-cloudy',
            'rain', 'snow', 'tree', 'corn', 'sprout', 'wheat', 'asleep-filled'
        ]
    },
    {
        name: 'Game Icons',
        prefix: 'game-icons',
        icons: [
            'ninja-head', 'pirate-captain', 'cowled', 'viking-head', 'astronaut-helmet',
            'wizard-face', 'fairy', 'goblin-head', 'orc-head', 'dragon-head', 'wolf-head',
            'fox-head', 'bear-face', 'eagle-head', 'lion-head', 'unicorn', 'phoenix-head',
            'mermaid', 'treasure-map', 'crown', 'gem', 'sparkles', 'magic-swirl', 'moon-bats'
        ]
    }
];

// Flatten all icons into a searchable list
const ALL_AVATAR_ICONS = ICON_SETS.flatMap(set =>
    set.icons.map(icon => ({
        id: `${set.prefix}:${icon}`,
        name: icon.replace(/-/g, ' '),
        setName: set.name,
        prefix: set.prefix
    }))
);

export default function AvatarIconPicker({ selectedIcon, onSelect, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSet, setActiveSet] = useState(null);

    const filteredIcons = searchQuery
        ? ALL_AVATAR_ICONS.filter(icon =>
            icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            icon.setName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : activeSet
            ? ALL_AVATAR_ICONS.filter(icon => icon.prefix === activeSet)
            : ALL_AVATAR_ICONS;

    const handleIconSelect = (iconId) => {
        onSelect(iconId);
        if (onClose) onClose();
    };

    return (
        <div className="avatar-icon-picker">
            <div className="avatar-picker-header">
                <h3>Choose Avatar Icon</h3>
                {onClose && (
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="avatar-picker-search">
                <Input
                    placeholder="Search icons..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setActiveSet(null);
                    }}
                    leftIcon={<Search size={16} />}
                    fullWidth
                />
            </div>

            <div className="avatar-set-tabs">
                <button
                    className={`set-tab ${!activeSet && !searchQuery ? 'active' : ''}`}
                    onClick={() => { setActiveSet(null); setSearchQuery(''); }}
                >
                    All
                </button>
                {ICON_SETS.map(set => (
                    <button
                        key={set.prefix}
                        className={`set-tab ${activeSet === set.prefix ? 'active' : ''}`}
                        onClick={() => { setActiveSet(set.prefix); setSearchQuery(''); }}
                    >
                        {set.name}
                    </button>
                ))}
            </div>

            <div className="avatar-picker-grid">
                {filteredIcons.length > 0 ? (
                    filteredIcons.map((icon) => (
                        <button
                            key={icon.id}
                            className={`avatar-icon-option ${selectedIcon === icon.id ? 'selected' : ''}`}
                            onClick={() => handleIconSelect(icon.id)}
                            title={`${icon.name} (${icon.setName})`}
                            type="button"
                        >
                            <Icon icon={icon.id} width={28} height={28} />
                        </button>
                    ))
                ) : (
                    <div className="no-icons">
                        <p className="text-secondary">No icons found</p>
                    </div>
                )}
            </div>

            <div className="avatar-picker-footer">
                <p className="text-tertiary">
                    {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
                </p>
            </div>
        </div>
    );
}
