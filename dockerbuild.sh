#!/bin/bash

#npm rebuild node-sass
./clean.sh
chmod 777 gui/ -R
./build.sh gui
./build.sh iconpacks
./build.sh themes
./build.sh apps "Admin, Announcements, Calculator, Calendar, Chat, Contacts, CRM, CRMAdmin, HelpApp, ImageUploader, Mail, MailAdmin, Preferences,Task, TaskAdmin, Analytics, Timesheet, Profile"
./build.sh bos
echo build completed successfully
