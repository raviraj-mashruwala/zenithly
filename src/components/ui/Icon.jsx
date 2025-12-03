import * as LucideIcons from 'lucide-react';

// Helper component to render an icon by its ID
export default function Icon({ iconId, size = 20, className = '', ...props }) {
    // Convert icon-id to IconName format for Lucide
    const iconName = iconId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const IconComponent = LucideIcons[iconName] || LucideIcons.Circle;

    return <IconComponent size={size} className={className} {...props} />;
}
