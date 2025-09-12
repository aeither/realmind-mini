import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { leaderboardService, type TokenHolder } from '../libs/leaderboardService';
import { getContractAddresses } from '../libs/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const chainName = chain?.name || 'Unknown';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center">
            <span className="text-3xl mr-3">🏆</span>
            <div>
              <DialogTitle className="text-2xl font-bold">Leaderboard</DialogTitle>
              <DialogDescription className="text-sm">
                Top XP holders on {chainName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-lg">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-destructive text-lg mb-4">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-muted-foreground text-lg">No token holders found</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex justify-center items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{totalHolders}</div>
                    <div className="text-sm text-muted-foreground">Total Shown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{chainName}</div>
                    <div className="text-sm text-muted-foreground">Network</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-y-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Address</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">XP Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders.map((holder, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={holder.address} className="border-t hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {rank <= 3 && (
                                <span className="mr-2 text-lg">
                                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                              <span className={`font-semibold ${
                                rank <= 3 ? 'text-primary' : 'text-foreground'
                              }`}>
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {leaderboardService.truncateAddress(holder.address)}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-foreground">
                              {leaderboardService.formatBalance(holder.balance)} XP
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Data updates every 5 minutes</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}