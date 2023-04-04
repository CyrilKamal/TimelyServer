# Timely Server
Server that optimizes your Google Maps route by efficiently rearranging intermediate waypoints to provide you with a shorter and more optimized route with additional statistics.
## Quirks
- We decided to do our API calls through a server instead of natively in the extension for performance reasons, but this logic that we are using is valuable to us and probably to others. Google Chrome won't allow you to obfuscate your code for an extension, so we said why don't we offload all the calculations to our server and just request an optimized link from the server to 'hide' that logic from people that can just view the source code of our extension.
- My API key here is public because this server was private and deployed through Cyclic. Then I decided to make it public so judges could see the whole Google Maps Platform part of the Solution. I have published this publicly, and Cyclic won't let me change the repository that's attached to that server Link, so I can't just create a new private server and change it to that (plus, I am only using a free trial Google cloud credits anyway)
- I was having issues implementing this idea that I had in my head. An in-depth read can be seen [HERE](https://stackoverflow.com/questions/75646642/how-to-resolve-getting-an-unambiguous-error-message-from-node-js-client-for-goog/75667566#75667566), but I couldn't get an error message from the Directions API Node.JS client Request and couldn't develop. I asked in the Google Maps Platform Discord and on Stack Overflow, but I found an actual bug in the package that was raised [HERE](https://github.com/googlemaps/google-maps-services-js/issues/952). After a last-ditch effort, I took some time to convert my code to the deprecated package and got error messages and responses and appropriately developed. So that is why we are using the deprecated package
## Usage
### 1. Git clone the project into the directory of your choosing. (git clone https://github.com/CyrilKamal/TimelyServer.git)
### 2. Uncomment the localhost listen code and comment out the prod listen statement
![image](https://user-images.githubusercontent.com/43249970/229914975-4d089e65-ab30-4cc6-9148-0b3fd9c5703f.png)
![ezgif com-video-to-gif](https://user-images.githubusercontent.com/43249970/229914828-83a197c7-e7f5-4734-b2d5-a90f0316e0ae.gif)
### 3. run ```node depserver.js```
