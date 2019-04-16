
#!/bin/bash

# mongodb installeren
apt-get update && apt-get install mongodb -y

# mongodb starten
service mongodb start

# git installeren
apt-get update && apt-get install git -y

# naar juiste map toe
cd ~

# git checkout
git clone https://github.com/niemantsverdriet/Verdi.git

# admin user aan de database toevoegen
mongo < ~/Verdi/setup.js

# data importeren
mongoimport --db ROS --collection system__datamodels --file ~/Verdi/installation/start-system__datamodels.json
mongoimport --db ROS --collection system__fields --file ~/Verdi/installation/start-system__fields.json
mongoimport --db ROS --collection system__apps --file ~/Verdi/installation/start-system__apps.json
mongoimport --db ROS --collection system__users --file ~/Verdi/installation/start-system__users.json

# nodejs installeren
cd ~
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt-get update && apt-get install nodejs -y

