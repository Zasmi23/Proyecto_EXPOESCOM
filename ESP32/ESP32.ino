#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error El Bluetooth no está habilitado en este chip.
#endif

BluetoothSerial SerialBT;

#define RXD2 16
#define TXD2 17

unsigned long ultimaVerificacion = 0;
const long intervaloBT = 2000; 

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2); 
  
  SerialBT.begin("DualMCU_Sensores"); 
  Serial.println("¡Bluetooth iniciado!");
}

void loop() {
  
  if (Serial2.available()) {
    String mensajeRecibido = Serial2.readStringUntil('\n'); 
    SerialBT.println(mensajeRecibido);
  }

if (millis() - ultimaVerificacion > 500) { 
    if (SerialBT.hasClient()) {
        Serial2.print('1'); 
    } else {
        Serial2.print('0'); 
    }
    ultimaVerificacion = millis();
}
}