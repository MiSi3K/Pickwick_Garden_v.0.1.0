from flask import *
import RPi.GPIO as GPIO
import time, thread, shelve
#-----------------------------------------------------------------------
app = Flask(__name__)
#-----------------------------------------------------------------------
#Glogal variables
gPin = [4,17,27,22,10,9];
gStatusM = [1,1,1,1,1,1];
gStatusA = [1,1,1,1,1,1];
gDurationM = [10,10,10,10,10,10];
gDurationA = [1,1,1,1,1,1];
gSchedule = [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0];
#Global flagse
fStop = False;
fManual = False;
fAutomatic = False;
fRunning = False;
fHour = False;
#Global comments
gComment1 = "test1";
gComment2 = "test2"; 
#-----------------------------------------------------------------------
#GPIO pin set up
def sprinkle_init(lPinDef):
	GPIO.setwarnings(False) # suppress GPIO used message
	GPIO.setmode(GPIO.BCM) # use BCM pin numbers
	for i in range(0,6):
		GPIO.setup(lPinDef[i], GPIO.OUT) # set pins as output
		GPIO.output(lPinDef[i], GPIO.HIGH)
#Save Settings
def Save_Settings ():
	global gStatusM ,gStatusA, gDurationM, gDurationA, gSchedule
	settingFile = shelve.open('settings')
	settingFile['gStatusM'] = gStatusM
	settingFile['gStatusA'] = gStatusA
	settingFile['gDurationM'] = gDurationM
	settingFile['gDurationA'] = gDurationA
	settingFile['gSchedule'] = gSchedule
	settingFile.close()
#Load Settings
def Load_Settings ():
	global gStatusM, gStatusA, gDurationM, gDurationA, gSchedule
	settingFile = shelve.open('settings')
	gStatusM = settingFile['gStatusM']
	gStatusA = settingFile['gStatusA']
	gDurationM = settingFile['gDurationM']
	gDurationA = settingFile['gDurationA']
	gSchedule = settingFile['gSchedule']
	settingFile.close()
#-----------------------------------------------------------------------
#Initial Function Block
sprinkle_init(gPin)
Load_Settings()
#-----------------------------------------------------------------------
#Run sequence function - parent function
def sprinkle(lPinDef, lStatus, lDuration):
	global fStop, gComment1, gComment2;
	for i in range(0,6):
		if fStop == False:
			if lStatus[i] == 1:
				print 'Rozpoczynam podlewanie sekcji :', i+1, ' przez ', lDuration[i], ' min'
				gComment1 = 'Rozpoczynam podlewanie sekcji : ' + str(i+1) + ' przez ' + str(lDuration[i]) + ' min'
				sprinkle_run(lPinDef[i], lDuration[i], i)
			else:
				print 'Section ', i+1,' switched off'
				gComment1 = 'Section ' + str(i+1) + ' switched off'
		else:
			print 'Przerwano podlewanie na sekcji ', i
			gComment1 = 'Przerwano podlewanie na sekcji ' + str(i)
			break
		gComment1 = 'Zakonczono Podlewnie'
		gComment2 = 'o godzinie ' + (time.strftime("%H:%M:%S", time.localtime()))
#-----------------------------------------------------------------------
#Single section run	function - child function
def sprinkle_run(lPinDef, lDuration, i):
	global fStop, gComment2
	GPIO.output(lPinDef, GPIO.LOW)
	for j in range (0,lDuration * 60):
		if fStop == False:
			gSec = (lDuration *60) - j	
			gMin = gSec / 60
			gSec = gSec % 60
			print 'Podlewam jeszcze przez:', gMin , ' minut ' , gSec , ' sekund'
			gComment2 = 'Podlewam jeszcze przez: ' + str(gMin) + ' minut ' + str(gSec) + ' sekund'
			j= j + 1
			time.sleep(1)
		else:
			print 'Przerwa na zadanie'
			gComment2 = 'Przerwa na zadanie'
			break
	GPIO.output(lPinDef, GPIO.HIGH)
#----------------------------------------------------------------------- 
@app.route('/')
def main(): 
	return render_template('main.html')
#----------------------------------------------------------------------- 
@app.route("/_LoadSettings")
def _LoadSettings():
	global gStatusM, gDurationM, gSchedule, gDurationA, gStatusA
	return jsonify(exStateM = gStatusM, exTimeM = gDurationM, exSchedule = gSchedule, exStateA = gStatusA, exTimeA = gDurationA)
#----------------------------- ------------------------------------------
@app.route("/_SaveSettings")
def _SaveSettings():
	global gStatusM, gDurationM, gSchedule, gDurationA ,gStatusA
	for i in range (0,6):
		vInputSM='statusM'+str(i+1)
		vInputTM='timeM'+str(i+1)
		vInputSA='statusA'+str(i+1)
		vInputTA='timeA'+str(i+1)
		gStatusM[i]=int(request.args.get(vInputSM))
		gDurationM[i]=int(request.args.get(vInputTM))
		gStatusA[i]=int(request.args.get(vInputSA))
		gDurationA[i]=int(request.args.get(vInputTA))
	for i in range (0,24):
		vInputH='Schedule'+str(i)
		gSchedule[i]=int(request.args.get(vInputH))
	Save_Settings()
	return "" 
#-----------------------------------------------------------------------
@app.route("/_stop")
def _stop():
	global fStop
	fStop = True
	return ""
#-----------------------------------------------------------------------
@app.route("/_sprinkler")
def _sprinkler():
	global fManual, fStop
	fStop = False;
	fManual = True;
	return "" 
#----------------------------------------------------------------------- 
@app.route("/_automatic")
def _automatic():
	global fAutomatic, fManual, fStop
	fStop = False
	fManual = False
	if fAutomatic == False:
		fAutomatic = True
	else:
		fAutomatic = False		
	return ""
#-----------------------------------------------------------------------   
@app.route("/_status")
def statusCheck():
	global fRunning, gComment1, gComment2, fAutomatic
	return jsonify(sRunning = fRunning, sComment1 = gComment1, sComment2 = gComment2, sAutomatic = fAutomatic)
#-----------------------------------------------------------------------   
def tUpdate (refresh):
	lFlag = 0
	global gStatusM, gDurationM, gStatusA, gDurationA, gPin, fRunning, fAutomatic, gSchedule, fHour, fManual, fStop	
	while True:
		if fAutomatic == True:
			lHour = int(time.strftime("%H", time.localtime()))
			if gSchedule[lHour] == 1 and fHour	== True:
				fStop = False
				fRunning = True
				sprinkle(gPin,gStatusA,gDurationA)
				fRunning = False
				fHour = False
				lFlag = lHour
			if lHour != lFlag:
				fHour = True
			fStop = True
			time.sleep(1)
		else:	
			if fManual == True:
				fRunning = True
				sprinkle(gPin,gStatusM,gDurationM)
				fRunning = False
				fManual = False
		time.sleep(1) 
#-----------------------------------------------------------------------   
thread.start_new_thread(tUpdate ,('refresh',))
#-----------------------------------------------------------------------
if __name__ == "__main__":
	app.run(host='192.168.1.12', port=8080, debug=True)
    
