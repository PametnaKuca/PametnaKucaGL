#include <stdio.h>
#include <string.h>
#include <malloc.h>

#include "common/platform.h"
#include "common/cs_file.h"
#include "mgos_app.h"
#include "mgos_gpio.h"
#include "mgos_sys_config.h"
#include "mgos_timers.h"
#include "mgos_hal.h"
#include "mgos_dlsym.h"
#include "mjs.h"

/* Sizes of each part of the package */
#define MAX_PACK_LEN 999
#define SIZE_STR_LEN 3
#define ID_STR_LEN 1
#define SUB_ID_STR_LEN 1
#define CONF_STR_LEN 1
#define XOR_STR_LEN 1
#define EXTRA_STR_LEN (ID_STR_LEN + SUB_ID_STR_LEN + CONF_STR_LEN + XOR_STR_LEN)

/*  Function that removes quotation marks that get created as a result of 
 *  JSON.stringify method used on slave ESP
 *	@param str - input string received from communication
 *	return - string without first and last character
 */
char *removeQuotationESP(char *str){
	static char *tempStr;
	tempStr = str;
	tempStr++;
	tempStr[strlen(tempStr)-1] = 0;
	return tempStr;
}

/*  Function that returns character value of an integer
 *  Used for converting hexadecimal to string
 *  @param characterToReturn - hexadecimal character for conversion
 *  return - stringified character
 */
char *returnChar(int characterToReturn){
	static char retVal[2];
	retVal[0] = (char) characterToReturn;
	retVal[1] = '\0';
	return retVal;
}

/*  Function parses temperature from message data input string
 *  @param str - string in form "temperature,humidity", withouth quotation marks
 *  return - all characters till comma
 */
char *returnTemperatureESP(char *str){
    static char temp[10] = "";
    int i;
    int offset = 0;
    for(i = 0; str[i] != '\0'; i++){
        if(((str[i] >= '0') && (str[i] <= '9')) || (str[i] == '.')){
            //printf("DEBUG1: %c\n", str[i]);
            offset += sprintf(temp + offset, "%c", str[i]);
        } else {
            return temp;
        }
    }
	return temp;
}

/*  Function parses humidity from message data input string
 *  @param str - string in form "temperature,humidity", withouth quotation marks
 *  return - all characters after comma
 */
char *returnHumidityESP(char *str){
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
            return hum;
        }
    }
    return hum;
}

/*  Function checks if the received string is valid by xor-ing 
 *  input string (ignoring the last byte) and compares it with 
 *  the last byte which is before calculated xor value
 *  Additionaly, function counts takes required size of the message and while
 *  calculating xor value, calculates received string size.
 *	@param str -> string to check
 *  @param size -> size of the string (without first 3 bytes)
 * 	return -> 0 if different string was received than sent, 1 if strings are same
 */
int checkIfValidESP(char* str, int size){
	char xorString = *str;
	char *nextChar = str + 1;
	int tempSize = 1;
	while(*(nextChar + 1) != '\0'){
		xorString = xorString ^ *(nextChar++);
		tempSize++;
	}
	printf("Got: %c, Required: %c\r\n", xorString, *nextChar);
	tempSize = tempSize + XOR_STR_LEN - SIZE_STR_LEN;
	if((*nextChar == xorString) && (tempSize == size))
		return 1;
	printf("Received and sent string are different!\r\n");
	return 0;
}

/*  Function which parses first 3 bytes from the input string
 * 	@param str -> string to parse
 *	return -> first 3 bytes of the string casted into short
 */
int getSizeESP(char *str){
	char size[SIZE_STR_LEN];
	int i;
	for (i = 0; i < SIZE_STR_LEN; i++){
		size[i] = *(str++);
	}
	return (short) atoi(size);
}

/*  Function parses out ID (4th byte) from the input string 
 *	@param str - message received from other device 
 *  return - fourth byte (ID)
 */
char *getIDESP(char *str){
	static char ID[2] = "";
	int i;
	for(i = 0; i < SIZE_STR_LEN; i++)
		str++;
	ID[0] = *str;
	return ID;
}

/*  Function parses out subID (5th byte) from the input string 
 *	@param str - message received from other device 
 *  return - fifth byte (subID)
 */
char *getSubIDESP(char *str){
	static char subID[2] = "";
	int i;
	for(i = 0; i < (SIZE_STR_LEN + ID_STR_LEN); i++)
		str++;
	subID[0] = *str;
	return subID;
}

/*  Function parses out configuration byte (6th byte) from the input string 
 *	@param str - message received from other device 
 *  return - sixth byte (configuration)
 */
char *getConfESP(char *str){
	static char conf[2] = "";
	int i;
	for(i = 0; i < (SIZE_STR_LEN + ID_STR_LEN + SUB_ID_STR_LEN); i++)
		str++;
	conf[0] = *str;
	return conf;
}


/*	Function parses message(sensor data) of the received string.  
 *	@param str -> input string
 *	@param size -> size of the string excluding first 3 bytes 
 *	return -> pointer to the first character of the message
 */
char *getMessageESP(char *str, int size){
	char *tempMessage = (char *) malloc(sizeof (char) * (size - EXTRA_STR_LEN + 1));
	int i;
	char c[2] = " ";
	
	*tempMessage = '\0';
	/* Skip size, ID, subID and configuration bytes */
	for(i = 0;i < (SIZE_STR_LEN + ID_STR_LEN + SUB_ID_STR_LEN + CONF_STR_LEN); i++)
		str++;
	for(i = 0; i < (size - EXTRA_STR_LEN); i++){
		c[0] = *(str++);
		strcat(tempMessage, c);
	}
	return tempMessage;
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
