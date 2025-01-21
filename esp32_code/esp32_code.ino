#include "WiFi.h"
#include "ESPAsyncWebServer.h"

const char* ssid = "esp32-wifi@terrafoid";
const char* password = "87654321";

AsyncWebServer server(80);

int enable1_2 = 13; // Motor enable pin
int enable3_4 = 25; // Motor enable pin

int inp1 = 12; // Input pin for motor direction
int inp2 = 14;
int inp3 = 27;
int inp4 = 26;

int led = 2; // Onboard LED

bool systemOn = false; // System state flag

void setup() {
  WiFi.softAP(ssid, password);

  pinMode(enable1_2, OUTPUT);
  pinMode(enable3_4, OUTPUT);
  pinMode(inp1, OUTPUT);
  pinMode(inp2, OUTPUT);
  pinMode(inp3, OUTPUT);
  pinMode(inp4, OUTPUT);
  pinMode(led, OUTPUT);

  // Initialize the system in the off state
  digitalWrite(enable1_2, LOW);
  digitalWrite(enable3_4, LOW);
  digitalWrite(led, LOW);

  // Web server endpoint
  server.on("/control", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (request->hasArg("on")) {
      systemOn = true;
      digitalWrite(led, HIGH); // Turn on LED
      request->send(200, "text/plain", "System ON");
    }
    else if (request->hasArg("off")) {
      systemOn = false;
      digitalWrite(led, LOW); // Turn off LED
      // Stop motors
      digitalWrite(enable1_2, LOW);
      digitalWrite(enable3_4, LOW);
      request->send(200, "text/plain", "System OFF");
    }
    else if (systemOn && request->hasArg("left")) {
      analogWrite(enable1_2, 192);
      analogWrite(enable3_4, 192);
      digitalWrite(inp1, LOW);
      digitalWrite(inp2, HIGH);
      digitalWrite(inp3, HIGH);
      digitalWrite(inp4, LOW);
      request->send(200, "text/plain", "Steering Left");
    }
    else if (systemOn && request->hasArg("right")) {
      analogWrite(enable1_2, 192);
      analogWrite(enable3_4, 192);
      digitalWrite(inp1, HIGH);
      digitalWrite(inp2, LOW);
      digitalWrite(inp3, LOW);
      digitalWrite(inp4, HIGH);
      request->send(200, "text/plain", "Steering Right");
    }
    else {
      request->send(400, "text/plain", "Invalid or No Command");
    }
  });

  server.begin();
}

void loop() {
  // No additional logic in the main loop
}
