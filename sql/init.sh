default_password="atsuo_judge"

echo "This script will throw error if the database is already initialized."
read -r -p "Are you sure to initialize the database? [y/N] " response
case "$response" in
[yY][eE][sS] | [yY])
	echo "Please enter the root password."
	mysql -u root -p <./sql/init.sql && echo "Done!"
	read -r -p "Enter the new password for the user 'atsuo_judge'@'localhost': " password
	mysql -u atsuo_judge --password="$default_password" -e "SET PASSWORD = '$password';" && echo "Done!"
	;;
*)
	echo "Canceled."
	exit 1
	;;
esac
