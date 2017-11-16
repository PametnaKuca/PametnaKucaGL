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


/*  The function measures and returns string length.
 *  @param string which we want to measure
 *	return - size of the string
 */
short stringLength(char *str){
	char *tempStr = str;
	short len = 0;
	while(*(tempStr++) != '\0')
		len++;
	return len;
}

/*	Function that calculates XOR value of the input string. 
 *  @param message - string to calculate XOR value of 
 *  return - xor value of the string
 */
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


/*  Function creates a package from input parameters, calculates xor value of 
 *  the message. Shape of the package is ID|subID|Conf|data|xor, without |
 *	@param ID - ID of the device
 *	@param subID - subID of the sensor
 *	@param conf - configuration byte 
 *	@param data - sensor data (temperature, humidity, RFID etc.)
 *	return - created package in above mentioned shape
 */
char* createPackage(int ID, int subID, int conf, char *data)
{
	static char packageTemp[MAX_PACK_LEN + 1], *xor;
	//static char strID[3], strSubID[3], strConf[3], xorStr[3];
	short size = stringLength(data) + 4; // Message length + ID byte + SUB_ID byte + CTRL byte + XOR byte
	int sizeCnt = 0;
	int i = 0;

	char protocolData[] = {(char)ID , (char)subID, (char)conf, '\0'};

	//Adding input parameters to their respective strings
	sprintf(packageTemp, "%.3d", size);
	strcat(packageTemp,protocolData);
	strcat(packageTemp,data);

	//Adding XOR to the package
	xor = stringXOR(packageTemp);
	strcat(packageTemp, xor);

	while(packageTemp[i++] != '\0')
		sizeCnt++;
	return packageTemp;
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
