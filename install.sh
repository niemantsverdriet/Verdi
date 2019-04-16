
#!/bin/bash

# apt bijwerken
apt-get update

# mongodb installeren
apt-get install mongodb -y

# mongodb starten
service mongodb start

# git installeren
apt-get update && apt-get install git -y

# map aanmaken
cd ~
mkdir Verdi
cd Verdi

# git checkout
git clone https://github.com/niemantsverdriet/Verdi.git