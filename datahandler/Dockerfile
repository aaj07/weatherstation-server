FROM ubuntu 

#no-cache since the cache would make the image bigger than needed.
RUN apt-get update && apt-get install --no-install-recommends -y \ 
python3-setuptools \
python3 \ 
python3-pip \
&& rm -rf /var/lib/apt/lists/*

 #create the folder app
ADD requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
COPY ./main.py main.py
CMD python3 main.py