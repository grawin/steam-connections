# steam-connections
AngularJS app for visualizing connections between friends on Steam

## Goal
The goal of this project is to get more experience using AngularJS and to try out D3.js.

## Description
Users are greeted by a login page with several options. They can login using their Steam credentials, provide a numerical Steam ID, or try the demo. The demo simply runs the app with a pre-canned Steam ID. Once a Steam ID is submitted the app gathers user data from the public facing Steam Web API. This API requires a private key so a backend service must be in place to make the API calls. In the interest of using cheap web hosting PHP is used on the backend. Once user data is gathered a force directed graph is created of the logged in user's friend list. Each friend can be selected from the displayed list to update the graph based on that specific friend.

## Limitations
Friend lists of user's with private profiles cannot be accessed using the Steam Web API.
