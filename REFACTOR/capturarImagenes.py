#imports
import cv2
import uuid
import os

#Init Webcam
cap = cv2.VideoCapture(0)
result = True

while result:
    obtain, frame = cap.read()

    # Simulating mirror image
    frame = cv2.flip(frame, 1)
        

    # Coordinates of the Region of Interest
    x1 = int(0.5*frame.shape[1])
    y1 = 10
    x2 = frame.shape[1]-10
    y2 = int(0.5*frame.shape[1])
    # Drawing the Region of Interest
    # The increment/decrement by 1 is to compensate for the bounding box
    cv2.rectangle(frame, (x1-1, y1-1), (x2+1, y2+1), (255,0,0) ,1)
    # Extracting the Region of Interest
    roi = frame[y1:y2, x1:x2]
    roi = cv2.resize(roi, (64, 64)) 
     
    cv2.imshow("Frame", frame)
        
    # do the processing after capturing the image!
    roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, roi = cv2.threshold(roi, 120, 255, cv2.THRESH_BINARY)
    cv2.imshow("ROI", roi)

    if cv2.waitKey(1) == ord('c'):
        #Image with no filter
        pathNoFilter = 'C:/Users/Yulisa/Desktop/Imagenes/SinFiltro'
        image_name = str(uuid.uuid4()) + ".png"
        cv2.imwrite(os.path.join(pathNoFilter , image_name), frame[y1:y2, x1:x2])
        print("Foto guardada sin filtro {}".format(image_name))

        #Image with filter
        pathFilter = 'C:/Users/Yulisa/Desktop/Imagenes/ConFiltro'
        cv2.imwrite(os.path.join(pathFilter , image_name), roi)
        print("Foto guardada con filtro {}".format(image_name))
        
        result = True

    interrupt = cv2.waitKey(10)
    if interrupt & 0xFF == 27: # esc key
        result = False

cap.release()
cv2.destroyAllWindows()
