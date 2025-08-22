cast call 0x9599861081C211E5C289cD833eeC9EE223Bcd51A "owner()(address)" \
  --rpc-url https://hyperion-testnet.metisdevops.link

source .env && cast send 0x9599861081C211E5C289cD833eeC9EE223Bcd51A \
  "transferOwnership(address)" \
  0x37E2619161ACe4149FD9366F30846DB909bd2A07 \
  --rpc-url https://hyperion-testnet.metisdevops.link \
  --private-key ${PRIVATE_KEY}
