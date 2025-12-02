import { useEffect, useState } from 'react';
import { Plus, Eye, EyeOff, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/currency';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import WalletCard from '../../components/wallets/WalletCard';
import WalletFormModal from '../../components/wallets/WalletFormModal';
import './WalletsList.css';

export default function WalletsList() {
    const { user } = useAuthStore();
    const {
        wallets,
        isLoading,
        fetchWallets,
        getTotalBalance,
        getActiveWallets,
        getArchivedWallets,
    } = useWalletStore();

    const [showBalance, setShowBalance] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);

    useEffect(() => {
        if (user) {
            fetchWallets();
        }
    }, [user, fetchWallets]);

    const activeWallets = getActiveWallets();
    const archivedWallets = getArchivedWallets();
    const totalBalance = getTotalBalance();

    // Get user's currency from profile (would come from user settings)
    const userCurrency = 'INR'; // TODO: Get from user profile

    const handleAddWallet = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleEditWallet = (wallet) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingWallet(null);
    };

    const handleSuccess = () => {
        fetchWallets();
        handleCloseModal();
        toast.success(editingWallet ? 'Wallet updated successfully' : 'Wallet created successfully');
    };

    if (isLoading && wallets.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container wallets-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-display">My Wallets</h1>
                    <p className="text-secondary">Manage all your accounts in one place</p>
                </div>
                <Button onClick={handleAddWallet} leftIcon={<Plus />}>
                    Add Wallet
                </Button>
            </div>

            {/* Total Balance Card */}
            <Card variant="elevated" padding="lg" className="total-balance-card">
                <div className="total-balance-header">
                    <div>
                        <div className="total-balance-label">Total Balance</div>
                        <div className="total-balance-amount">
                            {showBalance ? (
                                formatCurrency(totalBalance, userCurrency)
                            ) : (
                                <span className="masked-amount">••••••</span>
                            )}
                        </div>
                        <div className="total-balance-info text-tertiary">
                            Across {activeWallets.filter(w => w.included_in_total).length} wallets
                        </div>
                    </div>
                    <button
                        className="balance-toggle"
                        onClick={() => setShowBalance(!showBalance)}
                        aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    >
                        {showBalance ? <Eye size={24} /> : <EyeOff size={24} />}
                    </button>
                </div>
            </Card>

            {/* Active Wallets */}
            {activeWallets.length > 0 ? (
                <div className="wallets-section">
                    <div className="section-header">
                        <h2>Active Wallets</h2>
                        <span className="wallet-count">{activeWallets.length}</span>
                    </div>
                    <div className="wallets-grid">
                        {activeWallets.map((wallet) => (
                            <WalletCard
                                key={wallet.id}
                                wallet={wallet}
                                showBalance={showBalance}
                                onEdit={() => handleEditWallet(wallet)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <Card padding="xl" className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No Wallets Yet</h3>
                    <p className="text-secondary">
                        Create your first wallet to start tracking your finances
                    </p>
                    <Button onClick={handleAddWallet} leftIcon={<Plus />}>
                        Add Your First Wallet
                    </Button>
                </Card>
            )}

            {/* Archived Wallets */}
            {archivedWallets.length > 0 && (
                <div className="wallets-section">
                    <button
                        className="section-toggle"
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        <Archive size={20} />
                        <span>Archived Wallets ({archivedWallets.length})</span>
                        <span className={`toggle-icon ${showArchived ? 'open' : ''}`}>▼</span>
                    </button>

                    {showArchived && (
                        <div className="wallets-grid">
                            {archivedWallets.map((wallet) => (
                                <WalletCard
                                    key={wallet.id}
                                    wallet={wallet}
                                    showBalance={showBalance}
                                    onEdit={() => handleEditWallet(wallet)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Wallet Form Modal */}
            {isModalOpen && (
                <WalletFormModal
                    wallet={editingWallet}
                    currency={userCurrency}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
