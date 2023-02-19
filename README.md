# CS:GO XP Tracker.

If you need to contact me, add `khufu#1111` on Discord.

### Dependencies
* Latest version of NodeJS
* A [non-limited](https://help.steampowered.com/en/faqs/view/71D3-35C2-AD96-AA3A) Steam account
* Optional:
   * Discord Account
   * Discord BOT Application


### Installing Dependencies
* **#1** Download the repository.
* **#2** Run ```npm install``` in the directory you installed the repo.



### Setup
* Navigate to config.json and fill out the required information. Check out cfgGuide.md if you're confused.
    * The Steam account used has to be [non-limited](https://help.steampowered.com/en/faqs/view/71D3-35C2-AD96-AA3A).
    * The account DOES NOT need Prime Status.
    * If you don't know how to get someones steam ID, [use this](https://steamid.io/).
* Run the script with ```node .``` or ```npm run start``` inside the programs directory.


### Version History & Changelogs
* 1.0.0
    * Release
        * Request steam user's cs:go xp stats at a set interval.
        * Display data in console/terminal.
        * Discord notifications.
