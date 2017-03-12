<?php

namespace steamapi;

// Utility class.
class Util {
  
  // Get Steam API key from config file.
  public static function getApiKey() {
    $configArray  = parse_ini_file(dirname(__FILE__).'/../config.ini');
    return $configArray['steam'];
  }

  // If session is not started, start it.
  public static function handleSession() {
    if (session_id() == "") {
      session_start();
    }
  }
}

// Steam API class that resolves requests using HTTP GET parameters.
class SteamApi {
  
  // Public entry point to resolve API call.
  public static function resolveApiCall() {
    $requestParts = explode('/', $_GET['url']);
    if (count($requestParts) > 0) {
      
      // For now function name is always first, then steam ID
      $functionName = $requestParts[0];
      $steamId = (count($requestParts) > 1) ? $requestParts[1] : 0;

      switch ($functionName) {
        case "friends":
          self::getFriends($steamId);
          break;
        case "summary":
          self::getSummary($steamId);
          break;
        case "get_current_user":
          self::getSessionSteamid();
          break;
        case "set_current_user":
          self::setSessionSteamid($steamId);
          break;
        default:
          echo "Invalid function ".$requestParts[0];
          break;
      }
    } else {
      echo "Invalid URL ".$_SERVER['REQUEST_URI']." ".var_dump($requestParts);
    }   
  }

  // Gets the current user's Steam ID from session data.
  private static function getSessionSteamid(){
    $steamId = (isset($_SESSION['steamid'])) ? $_SESSION['steamid'] : 0;

    $obj = (object) [
      'steamId' =>$steamId
    ];

    echo json_encode($obj);
  }

  // Sets the current user's Steam ID in the session data.
  private static function setSessionSteamid($steamId){
    $_SESSION['steamid'] = $steamId;
  }

  // Gets friend list from Steam Web API for the provided Steam ID.
  private static function getFriends($steamId){
    $steamApiKey = Util::getApiKey();
    $url = "http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=".$steamApiKey."&steamid=".$steamId."&relationship=friend";
    echo file_get_contents($url);  
  }

  // Gets summary data from Steam Web API for the provided Steam ID.
  private static function getSummary($steamId){
    $steamApiKey = Util::getApiKey();
    echo file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$steamApiKey."&steamids=".$steamId); 
  }
}

// Main execution point.
function main() {
  Util::handleSession();
  SteamApi::resolveApiCall();
}

main();

?>
