# steam-connections
AngularJS app for visualizing connections between friends on Valve's Steam game distribution service/social network.

## Goal
The goal of this project is to aggregate data from the [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API) using [AngularJS](https://angularjs.org/) on the front end with [D3.js](https://d3js.org/) and PHP on the backend.

## Description
Users are greeted by a login page with several options. They can login using their Steam credentials, provide a numerical Steam ID, or try the demo. The demo simply runs the app with a pre-canned Steam ID. Once a Steam ID is submitted the app gathers user data from the public facing Steam Web API. This API requires a private key so a backend service must be in place to make the API calls. In the interest of using cheap (shared) web hosting PHP is used on the backend. Once user data is gathered a force directed graph is created of the logged in user's friend list. Each friend can be selected from the displayed list to update the graph based on that specific friend.

### Backend

The backend provides two functions: authentication and an interface to query the Steam API using the private key. The authentication portion uses [Steam Auth](https://github.com/SmItH197/SteamAuthentication) a PHP project that uses [Light Open ID](https://github.com/iignatov/LightOpenID). The API querying portion simply looks at a URL parameter for function names and parameters. If you put a URL rewrite rule in place it can look something like this /steamapi/friends/:userSteamId.

Steam API keys are available here: https://steamcommunity.com/dev/apikey

#### Rewrite Sample
Generally you might want to use a rewrite rule for HTML5 mode in AngularJS with your /base/ dir. Additionally a rewrite rule can be put in place for making calls to the PHP API that allows for the more modern looking URLs like this: /steamapi/friends/:userSteamId.
```
<IfModule mod_rewrite.c>
RewriteEngine On
# rewrite rule for angular steam app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !index
RewriteRule steam/(.*) steam/index.php [L]
# rewrite rule for steamapi php at root level, could also do it for a libs dir
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule steamapi/(.*)$ steamapi.php?url=$1 [QSA,NC,L]
</IfModule>
```

#### Additional Setup
* Extract [Steam Auth](https://github.com/SmItH197/SteamAuthentication) in assets/libs/steamauth and modify SteamConfig.php to use your Steam API key and domain name (alternatively modify it to read the common config.ini file mentioned below).
* Modify assets/libs/config.ini to contain your Steam API key

## Limitations
* Friend lists and other data of users with private profiles cannot be accessed using the Steam Web API.
* The Steam Web API requires an API key, this means backend infrastructure is needed to hide the key. I selected PHP because my web hosting runs the LAMP stack.

## Disclaimers
* Steam is a registered trademark of the Valve Corporation. See their legal info here: http://store.steampowered.com/legal/
* Loading icons garnered from Sam Herbert's [SVG Loaders](https://github.com/SamHerbert/SVG-Loaders)
