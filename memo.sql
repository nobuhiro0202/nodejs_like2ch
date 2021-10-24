create table users 
(
id int(10) auto_increment,
username varchar(255),
user_level int,
email varchar(255),
password varchar(255),
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
primary key (id)
);



create table comments 
(
id int(10) auto_increment,
userId int(10),
comment varchar(255),
create_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
primary key (id)
);


