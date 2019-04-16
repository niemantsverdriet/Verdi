
#!/bin/bash

# apt bijwerken
apt-get update

# gnupg installeren om keys te kunnen installeren
apt-get install gnupg -y

# de key voor mongodb toevoegen
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

# mongodb repository toevoegen aan apt
echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.0 main" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list

# apt wederom bijwerken
apt-get update

# mongodb installeren
sudo apt-get install -y mongodb-org

