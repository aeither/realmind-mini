import { useState, useEffect } from 'react';
import { getEnsName } from '@wagmi/core';
import { config } from '../wagmi';

interface UserProfile {
  profilePicUrl?: string;
  username?: string;
  ensName?: string;
  fid?: number;
}

interface NeynarResponse {
  user: {
    pfp_url: string;
    username: string;
    fid: number;
  };
}

interface NeynarBulkResponse {
  [address: string]: Array<{
    fid: number;
    username: string;
    pfp_url: string;
    custody_address: string;
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
  }>;
}

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY;

export function useUserProfile(address: string | undefined) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setProfile({});
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const newProfile: UserProfile = {};

      try {
        // Fetch ENS name
        try {
          const ensName = await getEnsName(config, {
            address: address as `0x${string}`,
          });
          if (ensName) {
            newProfile.ensName = ensName;
          }
        } catch (error) {
          console.debug('ENS lookup failed:', error);
        }

        // Fetch Neynar profile
        if (NEYNAR_API_KEY) {
          try {
            const res = await fetch(
              `https://api.neynar.com/v2/farcaster/user/custody-address/${address}`,
              { headers: { 'x-api-key': NEYNAR_API_KEY } }
            );

            if (res.ok) {
              const data: NeynarResponse = await res.json();
              newProfile.profilePicUrl = data.user.pfp_url;
              newProfile.username = data.user.username;
              newProfile.fid = data.user.fid;
            }
          } catch (error) {
            console.debug('Neynar lookup failed:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfile(newProfile);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return { profile, loading };
}

// Hook for batch fetching multiple user profiles
export function useUserProfiles(addresses: string[]) {
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!addresses.length) {
      setProfiles(new Map());
      return;
    }

    const fetchProfiles = async () => {
      setLoading(true);
      const newProfiles = new Map<string, UserProfile>();

      console.log(`[useUserProfiles] Fetching profiles for ${addresses.length} addresses`);

      // Fetch Neynar profiles in batch (up to 350 addresses at a time)
      if (NEYNAR_API_KEY) {
        try {
          // Split addresses into chunks of 350 (Neynar's limit)
          const chunkSize = 350;
          const addressChunks: string[][] = [];
          for (let i = 0; i < addresses.length; i += chunkSize) {
            addressChunks.push(addresses.slice(i, i + chunkSize));
          }

          console.log(`[useUserProfiles] Fetching ${addressChunks.length} chunk(s) from Neynar`);

          // Fetch all chunks in parallel
          const bulkResults = await Promise.all(
            addressChunks.map(async (chunk) => {
              try {
                const addressList = chunk.join(',');
                const res = await fetch(
                  `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${addressList}&address_types=custody_address,verified_address`,
                  { headers: { 'x-api-key': NEYNAR_API_KEY } }
                );

                if (res.ok) {
                  const data: NeynarBulkResponse = await res.json();
                  console.log(`[useUserProfiles] Neynar returned data for ${Object.keys(data).length} addresses`);
                  return data;
                } else {
                  console.error(`[useUserProfiles] Neynar API error: ${res.status} ${res.statusText}`);
                }
              } catch (error) {
                console.debug('Neynar bulk lookup failed for chunk:', error);
              }
              return {};
            })
          );

          // Merge all bulk results
          const mergedNeynarData: NeynarBulkResponse = {};
          bulkResults.forEach(result => {
            Object.assign(mergedNeynarData, result);
          });

          console.log(`[useUserProfiles] Total Neynar profiles fetched: ${Object.keys(mergedNeynarData).length}`);

          // Process each address and set initial profiles from Neynar
          for (const address of addresses) {
            const profile: UserProfile = {};

            // Check Neynar data first
            const addressLower = address.toLowerCase();
            const neynarUsers = mergedNeynarData[addressLower];

            if (neynarUsers && neynarUsers.length > 0) {
              // Use the first user if multiple are found
              const user = neynarUsers[0];
              profile.profilePicUrl = user.pfp_url;
              profile.username = user.username;
              profile.fid = user.fid;
              console.log(`[useUserProfiles] Found Neynar profile for ${address}: @${user.username}`);
            }

            newProfiles.set(addressLower, profile);
          }

          // Set profiles immediately so users see Neynar data
          setProfiles(new Map(newProfiles));

          // Fetch ENS names in the background (these are still individual calls, but less critical)
          // We do this separately so the UI updates immediately with Neynar data
          console.log(`[useUserProfiles] Fetching ENS names for ${addresses.length} addresses...`);
          const ensResults = await Promise.allSettled(
            addresses.map(async (address) => {
              try {
                const ensName = await getEnsName(config, {
                  address: address as `0x${string}`,
                });
                if (ensName) {
                  console.log(`[useUserProfiles] Found ENS name for ${address}: ${ensName}`);
                  return { address: address.toLowerCase(), ensName };
                }
              } catch (error) {
                console.debug(`ENS lookup failed for ${address}:`, error);
              }
              return null;
            })
          );

          // Update profiles with ENS names
          ensResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              const existing = newProfiles.get(result.value.address);
              if (existing) {
                existing.ensName = result.value.ensName;
              }
            }
          });

          // Update profiles again with ENS data
          setProfiles(new Map(newProfiles));
        } catch (error) {
          console.error('Error fetching Neynar profiles:', error);
        }
      } else {
        // If no Neynar API key, still try to fetch ENS names
        await Promise.all(
          addresses.map(async (address) => {
            const profile: UserProfile = {};

            try {
              const ensName = await getEnsName(config, {
                address: address as `0x${string}`,
              });
              if (ensName) {
                profile.ensName = ensName;
              }
            } catch (error) {
              console.debug(`ENS lookup failed for ${address}:`, error);
            }

            newProfiles.set(address.toLowerCase(), profile);
          })
        );

        setProfiles(newProfiles);
      }

      setLoading(false);
      console.log(`[useUserProfiles] Profile fetching complete`);
    };

    fetchProfiles();
  }, [addresses.join(',')]);

  return { profiles, loading };
}
