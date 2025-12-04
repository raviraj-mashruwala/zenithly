import { MoreVertical, Edit, Archive, ArchiveRestore, Trash2, Wallet } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWalletStore } from '../../stores/walletStore';
import { formatCurrency } from '../../utils/currency';
import Card from '../ui/Card';
import './WalletCard.css';

// Helper to render icon from icon ID
const renderIconFromId = (iconId, size = 20) => {
    if (!iconId) return <Wallet size={size} />;

    const iconName = iconId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <Wallet size={size} />;
};

export default function WalletCard({ wallet, showBalance, onEdit }) {
    const [showMenu, setShowMenu] = useState(false);
    const { archiveWallet, restoreWallet, deleteWallet } = useWalletStore();

    const handleArchive = async () => {
        try {
            await archiveWallet(wallet.id);
            toast.success('Wallet archived');
            setShowMenu(false);
        } catch (error) {
            toast.error(error.message || 'Failed to archive wallet');
        }
    };

    const handleRestore = async () => {
        try {
            await restoreWallet(wallet.id);
            toast.success('Wallet restored');
            setShowMenu(false);
        } catch (error) {
            toast.error(error.message || 'Failed to restore wallet');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteWallet(wallet.id);
            toast.success('Wallet deleted');
        } catch (error) {
            toast.error(error.message || 'Failed to delete wallet');
        }
    };

    const isArchived = wallet.status === 'Archived';

    return (
        <Card
            className={`wallet-card ${isArchived ? 'archived' : ''}`}
            hover={!isArchived}
        >
            <div className="wallet-header">
                <div className="wallet-icon">
                    <div className="wallet-type-badge">
                        {renderIconFromId(wallet.icon_id, 20)}
                    </div>
                </div>

                <div className="wallet-menu">
                    <button
                        className="menu-trigger"
                        onClick={() => setShowMenu(!showMenu)}
                        aria-label="Wallet options"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                            <div className="menu-dropdown">
                                <button className="menu-item" onClick={() => { onEdit(); setShowMenu(false); }}>
                                    <Edit size={16} />
                                    <span>Edit</span>
                                </button>

                                {!isArchived ? (
                                    <button className="menu-item" onClick={handleArchive}>
                                        <Archive size={16} />
                                        <span>Archive</span>
                                    </button>
                                ) : (
                                    <button className="menu-item" onClick={handleRestore}>
                                        <ArchiveRestore size={16} />
                                        <span>Restore</span>
                                    </button>
                                )}

                                <div className="menu-divider" />

                                <button className="menu-item danger" onClick={handleDelete}>
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="wallet-content">
                <div className="wallet-name">{wallet.name}</div>
                <div className="wallet-type text-tertiary">{wallet.type}</div>

                <div className="wallet-balance">
                    {showBalance ? (
                        formatCurrency(wallet.current_balance, wallet.currency)
                    ) : (
                        <span className="masked">••••••</span>
                    )}
                </div>

                {!wallet.included_in_total && (
                    <div className="wallet-badge">Not in total</div>
                )}
            </div>

            {isArchived && (
                <div className="archived-overlay">
                    <Archive size={16} />
                    <span>Archived</span>
                </div>
            )}
        </Card>
    );
}
