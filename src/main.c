#include <stdio.h>
#include <string.h>

#include "common/platform.h"
#include "common/cs_file.h"
#include "mgos_app.h"
#include "mgos_gpio.h"
#include "mgos_sys_config.h"
#include "mgos_timers.h"
#include "mgos_hal.h"
#include "mgos_dlsym.h"
#include "mjs.h"

char *returnTemperature(char *str){
    static char temp[10] = "";
    int i;
    int offset = 0;
    for(i = 0; str[i] != '\0'; i++){
        if(((str[i] >= '0') && (str[i] <= '9')) || (str[i] == '.')){
            //printf("DEBUG1: %c\n", str[i]);
            offset += sprintf(temp + offset, "%c", str[i]);
        } else {
            printf("%s\n", temp);
            return temp;
        }
    }
	return temp;
}

char *returnHumidity(char *str){
    static char hum[10] = "";
    int j = 0;
    int i;
    int offset = 0;

    while(str[j] != ','){
        j++;
    }
    j++;
    for(i = j; str[i] != '\0'; i++){

        if(((str[i] >= '0') && (str[i] <= '9')) || (str[i] == '.')){
            //printf("DEBUG2: %c\n", str[i]);
            offset += sprintf(hum + offset, "%c", str[i]);
        } else {
            printf("%s\n", hum);
            return hum;
        }
    }
    printf("%s\n", hum);
    return hum;
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
