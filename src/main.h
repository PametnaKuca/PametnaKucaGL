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

/*  Function parses temperature from input string  
 *  @param str -> input string in form (temp,hum)
 *  return -> temperature
 */
char *returnTemperature(char *str);

/*  Function parses humidity from input string  
 *  @param str -> input string in form (temp,hum)
 *  return -> humidity
 */
char *returnHumidity(char *str);

/*  Function checks if the received string is valid by xor-ing 
 *  input string (ignoring the last byte) and compares it with 
 *  the last byte which is before calculated xor value
 *  Additionaly, function counts takes required size of the message and while
 *  calculating xor value, calculates received string size.
 *	@param str -> string to check
 *  @param size -> size of the string (without first 3 bytes)
 * 	return -> 0 if different string was received than sent, 1 if strings are same
 */
int checkIfValid(char* str, int size);

/*  Function which parses first 3 bytes from the input string
 * 	@param str -> string to parse
 *	return -> first 3 bytes of the string casted into short
 */
int getSize(char *str);

/*  Function parses out ID (4th byte) from the input string 
 *  @param str -> string to parse
 *  return -> 4th byte (ID)
 */
char *getID(char *str);

/*  Function parses out subID (5th byte) from the input string 
 *  @param str -> string to parse
 *  return -> 5th byte (subID)
 */
char *getSubID(char *str);

/*  Function parses out configuration (6th byte) from the input string 
 *  @param str -> string to parse
 *  return -> 6th byte (configuration)
 */
char *getConf(char *str);

/*	Function parses message(sensor data) of the received string.  
 *	@param str -> input string
 *	@param size -> size of the string excluding first 3 bytes 
 *	return -> pointer to the first character of the message
 */
char *getMessage(char *str, int size);


