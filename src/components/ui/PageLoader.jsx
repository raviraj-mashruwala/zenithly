import LoadingSpinner from './LoadingSpinner';

export default function PageLoader() {
    return (
        <div className="page-loader" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            minHeight: '200px', // Prevent collapse on empty pages
            flex: 1
        }}>
            <LoadingSpinner size="lg" />
        </div>
    );
}
