
#!/bin/bash

# apt bijwerken
apt-get update

# mongodb installeren
apt-get install mongodb -y

# mongodb starten
service mongodb start