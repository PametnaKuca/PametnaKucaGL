#include "main.h"

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

int checkIfValid(char* str, int size){
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

int getSize(char *str){
	char size[SIZE_STR_LEN];
	int i;
	for (i = 0; i < SIZE_STR_LEN; i++){
		size[i] = *(str++);
	}
	return (short) atoi(size);
}

char *getID(char *str){
	static char ID[2] = "";
	int i;
	for(i = 0; i < SIZE_STR_LEN; i++)
		str++;
	ID[0] = *str;
	return ID;
}

char *getSubID(char *str){
	static char subID[2] = "";
	int i;
	for(i = 0; i < (SIZE_STR_LEN + ID_STR_LEN); i++)
		str++;
	subID[0] = *str;
	return subID;
}

char *getConf(char *str){
	static char conf[2] = "";
	int i;
	for(i = 0; i < (SIZE_STR_LEN + ID_STR_LEN + SUB_ID_STR_LEN); i++)
		str++;
	conf[0] = *str;
	return conf;
}

char *getMessage(char *str, int size){
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
