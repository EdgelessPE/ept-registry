@echo on
cd /d %~dp0
echo.==================
dir
node .\sync.js
echo.================
echo.OK

cd /d .\mirrors
dir 
git config --local user.email "bot@edgeless.top"
git config --local user.name "SyncBot"
git commit -m "Sync from source" -a
git push origin
cd .. 
