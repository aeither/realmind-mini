import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { leaderboardService, type TokenHolder } from '../libs/leaderboardService';
import { getContractAddresses } from '../libs/constants';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { chain } = useAccount();
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalHolders, setTotalHolders] = useState(0);

  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : null;

  const fetchLeaderboard = async () => {
    if (!chain || !contractAddresses) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await leaderboardService.getLeaderboard(
        contractAddresses.token1ContractAddress,
        chain.id,
        50 // Top 50 holders
      );

      if (result.success && result.holders) {
        setHolders(result.holders);
        setTotalHolders(result.totalHolders || 0);
      } else {
        setError(result.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && chain && contractAddresses) {
      fetchLeaderboard();
    }
  }, [isOpen, chain, contractAddresses]);

  if (!isOpen) return null;

  const chainName = chain?.name || 'Unknown';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🏆</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
              <p className="text-sm text-gray-600">Top XP holders on {chainName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-lg">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 text-lg">No token holders found</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-6">
                <div className="flex justify-center items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{totalHolders}</div>
                    <div className="text-sm text-orange-500">Total Shown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{chainName}</div>
                    <div className="text-sm text-orange-500">Network</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-y-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Address</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">XP Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders.map((holder) => (
                      <tr key={holder.address} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {holder.rank <= 3 && (
                              <span className="mr-2 text-lg">
                                {holder.rank === 1 ? '🥇' : holder.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span className={`font-semibold ${
                              holder.rank <= 3 ? 'text-orange-600' : 'text-gray-700'
                            }`}>
                              #{holder.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {leaderboardService.truncateAddress(holder.address)}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {leaderboardService.formatBalance(holder.balance)} XP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Data updates every 5 minutes</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}