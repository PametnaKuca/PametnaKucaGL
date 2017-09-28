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
#define MAX_MESSAGE_LEN (MAX_PACK_LEN - 4) //ID, subID, conf and xor size
#define SIZE_STR_LEN 3

struct package{
	short size;
	char ID;
	char subID;
	char conf;
	char message[MAX_MESSAGE_LEN];
	char xor;
};

struct package *parsePackage(char *str){
	
	struct package *package;
	int i;
	char size[SIZE_STR_LEN];
	char message[MAX_MESSAGE_LEN];

	/* Parse incoming string for package size */
	for (i = 0; i < SIZE_STR_LEN; i++){
		size[i] = str[i];
	}
	package->size = (short) atoi(size);


	/* Parse incoming string for sensor ID */
	if((i < (SIZE_STR_LEN + package->size)) && (str[i] != "\0")){
		package->ID = str[i];
		i++;
	} else {
		printf("ERROR: String not correct! Failed at ID!\n");
		printf("Returning NULL...\n");
		return NULL;
	}

	/* Parse incoming string for sub sensor ID */
	if((i < (SIZE_STR_LEN + package->size)) && (str[i] != "\0")){
		package->subID = str[i];
		i++;
	} else {
		printf("ERROR: String not correct! Failed at subId!\n");
		printf("Returning NULL...\n");
		return NULL;
	}

	/* Parse incoming string for configuration byte */
	if((i < (SIZE_STR_LEN + package->size)) && (str[i] != "\0")){
		package->conf = str[i];
		i++;
	} else {
		printf("ERROR: String not correct! Failed at conf!\n");
		printf("Returning NULL...\n");
		return NULL;
	}

	/* Parse incoming string for data message */
	for(i; i < (SIZE_STR_LEN + package->size) - 1; i++ ){
		if (str[i] == "\0"){
			printf("ERROR: Received string terminated before it should have!\n");
			printf("Returning NULL...\n");
			return NULL;
		} else {
			message[i - (SIZE_STR_LEN + package->size)] = str[i];
		}
	}
	package->message = message;

	/* Parse incoming string for xor check byte */
	if((i < (SIZE_STR_LEN + package->size)) && (str[i] != "\0")){
		package->xor = str[i];
		i++;
	} else {
		printf("ERROR: String not correct! Failed at xor!\n");
		printf("Returning NULL...\n");
		return NULL;
	}

	return package;
}
