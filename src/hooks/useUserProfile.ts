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

      // Fetch all profiles in parallel
      await Promise.all(
        addresses.map(async (address) => {
          const profile: UserProfile = {};

          try {
            // Fetch ENS name
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

            // Fetch Neynar profile
            if (NEYNAR_API_KEY) {
              try {
                const res = await fetch(
                  `https://api.neynar.com/v2/farcaster/user/custody-address/${address}`,
                  { headers: { 'x-api-key': NEYNAR_API_KEY } }
                );

                if (res.ok) {
                  const data: NeynarResponse = await res.json();
                  profile.profilePicUrl = data.user.pfp_url;
                  profile.username = data.user.username;
                  profile.fid = data.user.fid;
                }
              } catch (error) {
                console.debug(`Neynar lookup failed for ${address}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching profile for ${address}:`, error);
          }

          newProfiles.set(address.toLowerCase(), profile);
        })
      );

      setProfiles(newProfiles);
      setLoading(false);
    };

    fetchProfiles();
  }, [addresses.join(',')]);

  return { profiles, loading };
}
