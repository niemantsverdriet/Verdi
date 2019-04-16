
#!/bin/bash

# apt bijwerken
apt-get update

# mongodb installeren
apt-get install mongodb -y

# mongodb starten
service mongodb start

# git installeren
apt-get update && apt-get install git -y

# naar juiste map toe
cd ~

# git checkout
git clone https://github.com/niemantsverdriet/Verdi.git

