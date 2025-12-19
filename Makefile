srcopt = -s src/

firefox:
	web-ext build $(srcopt) -i "images/icon_128.xcf" --overwrite-dest
test:
	web-ext run $(srcopt)
