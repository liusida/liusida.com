This post is for documational purposes only. I'll record some of my ESP32 experiences.

(1) When using PlatformIO to flash, `pio run -t upload` is actually doing this:

```
~\.platformio\penv\Scripts\esptool --chip esp32s3 --port COM23 --baud 921600 --before default-reset --after hard-reset write-flash -z --flash-mode dio --flash-freq 80m --flash-size detect 0x0000 bootloader.bin 0x8000 partitions.bin 0x10000 firmware.bin 0xe000 boot_app0.bin
```

And boot_app0.bin can be found in `~\.platformio\packages\framework-arduinoespressif32\tools\partitions\boot_app0.bin`

(2) When using `littlefs`, we can't mount a partition to `/` because the library will check the last char, if it's `/`, it'll raise an error. We can mount it to something like `/data/`.

(3) When using Arduino framework instead of ESP-IDF, we can use `pschatzmann/arduino-audio-tools` and `pschatzmann/arduino-audio-driver` for audio. Don't forget to set the PA pin (Power Amplifier) to high, otherwise evenwhen Codec chip (ES8311) works perfectly, we won't here a sound. I2C is for setting up the Codec chip (SDA and SCL pins are needed), and later I2S is for sending the data to the Codec chip (BCK: Bit Clock, WS: Word Select, aka Left Right Clock, DATA, and MCK: Master Clock pins are needed).