@echo on
cd /d %~dp0
yarn
node .\sync.js

cd /d .\mirrors
git config --local user.email "bot@edgeless.top"
git config --local user.name "SyncBot"
git commit -m "Sync from source" -a

cd .. 
