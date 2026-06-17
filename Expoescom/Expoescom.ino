
#include <Adafruit_NeoPixel.h>

#define PIN_NEOPIXEL 24
#define NUM_LEDS 1

Adafruit_NeoPixel pixels(NUM_LEDS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

int pinAnalogico = A0; 
int pinAnalogico2 = A3; 
int pinAnalogico3= A2;

void setup() {
    Serial.begin(115200);
    Serial1.begin(115200); 

    pixels.begin();
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); 
    pixels.show();

    pinMode(pinAnalogico, INPUT);
    pinMode(pinAnalogico2, INPUT);
    pinMode(pinAnalogico3, INPUT);
    
    delay(500); 
}

void loop() {
    int valor = analogRead(pinAnalogico);
    int valor2 = analogRead(pinAnalogico2);
    int valor3= analogRead(pinAnalogico3);
    float temperatura = (float)valor * (50.0 / 1023.0);
    int porcentajeLuz = map(valor2, 0, 1023, 0, 100);
    float porcentajeHumedad = map(valor3,0,1023,0,100);

    //Voltajes recibidos
    float voltajeTemperatura= ((float)valor*3.3)/1023;
    
    float voltajeLuz= ((float)valor2*3.3)/1023;
    
    float voltajeHumedad= ((float)valor3*3.3)/1023;

    Serial.println(temperatura);
    Serial.println(porcentajeLuz);
    Serial.println(valor3);
    Serial1.print("{\"temp\":");
    Serial1.print(temperatura);
    Serial1.print(",\"Cantidad de luz\":");
    Serial1.print(porcentajeLuz);
    Serial1.print(",\"Humedad\":");
    Serial1.print(porcentajeHumedad);
    Serial1.print(",\"VoltajeTemperatura\":");
    Serial1.print(voltajeTemperatura);
    Serial1.print(",\"voltajeLuz\":");
    Serial1.print(voltajeLuz);
    Serial1.print(",\"voltajeHumedad\":");
    Serial1.print(voltajeHumedad);
    Serial1.println("}"); 

if (Serial1.available()) {
    while (Serial1.available() > 0) {
        char estado = Serial1.read();
        if (estado == '1' || estado == '0') { 
            if (estado == '1') {
                pixels.setPixelColor(0, pixels.Color(0, 255, 0)); 
            } else {
                pixels.setPixelColor(0, pixels.Color(255, 0, 0)); 
            }
            pixels.show();
        }
    }
}
    delay(5000);
}