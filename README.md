# TwitchWebhook
This is a test mainly for practicing how webhooks work and how twitch webhooks work/ Twitch-EventSub

---
### Setup

- run in your terminal  `npm install` or if you're using yarn `yarn`

- Rename the file `example.config.yml` to `config.yml`

- Write your parameters into the file, notes are written in the file:
```yml
clientID: Your Client ID
# When getting your client ID 
# Make sure the broadcaster you are getting the client ID for has authorised this link

#https://id.twitch.tv/oauth2/authorize?client_id=<CLIENTID>&redirect_uri=<OneOfTheLinksFromYourRedirectURL>&response_type=token&scope=bits:read%20channel:read:subscriptions
# <CLIENTID> = Your Client ID
# <OneOfTheLinksFromYourRedirectURL> = This is one of your links from the "OAuth Redirect URLs" on your twitch dev console

#Twitch Dev console can be found at:
#https://dev.twitch.tv/console/
clientSecret: This is your client secret you can obtain it from the offical twitch dev dashboard

```

### Runing the script

In your terminal just run `npm start` or `yarn start`

if you want to just use node, from the folder root run `node build/main.js`
