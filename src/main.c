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

#define MAX_PACK_LEN 999

/*
 *  The function measures and returns string length.
 *  @param string which we want to measure
 */
short stringLength(char *str){
	char *tempStr = str;
	short len = 0;
	while(*(tempStr++) != '\0')
		len++;
	return len;
}

char* stringXOR(char *message)
{
		static char xorString[2];
		char *tempMsg = message + 1;
		xorString[0] = *message;
		while(*tempMsg!='\0')
			xorString[0] = xorString[0] ^ *(tempMsg++);
		xorString[1] = '\0';
		return xorString;		
}

char* createPackage(int ID, int subID, int ctrl, char *data)
{
	static char packageTemp[MAX_PACK_LEN + 1], *xorStr;
	short size = stringLength(data) + 4; // Message length + ID byte + SUB_ID byte + CTRL byte + XOR byte
	char protocolData[] = {(char)ID , (char)subID, (char)ctrl, '\0'};
	sprintf(packageTemp, "%.3d", size);
	strcat(packageTemp,protocolData);
	strcat(packageTemp,data);
	xorStr = stringXOR(packageTemp);
	strcat(packageTemp, xorStr);
	return packageTemp;
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
