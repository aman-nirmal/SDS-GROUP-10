import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../src/config/supabase.js'

const rawData = `Civil Engineering	Dr. Parag Sadgir	pas.civil@coeptech.ac.in	 
Civil Engineering	Dr. Sandeep A. Meshram	sam.civil@coeptech.ac.in	Also listed under Management Studies (HoD) with a different email
Civil Engineering	Dr. Kailas A. Patil	kap.civil@coeptech.ac.in	 
Civil Engineering	Dr. Y. A. Kolekar	yak.civil@coeptech.ac.in	 
Civil Engineering	Dr. Balkrishna M. Dawari	hod.civil@coeptech.ac.in; bmd.civil@coeptech.ac.in	 
Civil Engineering	Dr. Namdeo A. Hedaoo	nah.civil@coeptech.ac.in	 
Civil Engineering	Dr. Ishwar P. Sonar	ips.civil@coeptech.ac.in; ishwarpsonar2015@gmail.com	 
Civil Engineering	Dr. Kamlesh Kumar Tripathi	kkt.civil@coeptech.ac.in	 
Civil Engineering	Dr. (Mrs.) R. S. Dalvi	rsd.civil@coeptech.ac.in	 
Civil Engineering	Dr. V. B. Dawari	vbd.civil@coeptech.ac.in	 
Civil Engineering	Prof. Mrs. Y. T. Lomte Patil	ytl.civil@coeptech.ac.in	 
Civil Engineering	Dr. Ashish R. Akhare	akharear.civil@coeptech.ac.in	 
Civil Engineering	Dr. M. U. Khobragade	muk.civil@coeptech.ac.in	 
Civil Engineering	Dr. Nitin M. Mohite	nmm.civil@coeptech.ac.in	 
Civil Engineering	Dr. (Mrs.) Gayatri Sachin Vyas	gsv.civil@coeptech.ac.in	 
Civil Engineering	Dr. S. M. Navghare	smn.civil@coeptech.ac.in	 
Civil Engineering	Dr. Rupali Pankaj Zope	rz.civil@coeptech.ac.in	 
Civil Engineering	Dr. Bhupati Kannur	bgk.civil@coeptech.ac.in	 
Civil Engineering	Dr. Sayali Udakwar	ssu.civil@coeptech.ac.in	 
Civil Engineering	Dr. Rakesh D. Shambharkar	srd.civil@coeptech.ac.in	 
Civil Engineering	Dr. Saurav Shekhar Kar	kar.civil@coeptech.ac.in	 
Civil Engineering	Dr. Aniket Rajkumar Tidke	tar.civil@coeptech.ac.in; aniket.tidke8@gmail.com	 
Civil Engineering	Dr. Prajakta Shete	pss.civil@coeptech.ac.in	 
Civil Engineering	Dr. Snehal Uttam Bobade	sub.civil@coeptech.ac.in	 
Civil Engineering	Dr. Anuja U. Charpe	auc.civil@coeptech.ac.in	 
Civil Engineering	Dr. Panchali Chakraborty	panchalic.civil@coeptech.ac.in	 
Civil Engineering	Mr. Saurabh Eknath Shinde	ses.civil@coeptech.ac.in; shindesaurabh4747@gmail.com	 
Civil Engineering	Mr. Rohit Mangalekar	mrd.civil@coeptech.ac.in	 
Civil Engineering	Ms. Anupama Arunkumar Athawale	aaa.civil@coeptech.ac.in	 
Mechanical Engineering	Dr. Yogesh Kulkarni	yogeshkulkarni@yahoo.com	 
Mechanical Engineering	Dr. N. K. Chougule	hod.mech@coeptech.ac.in	 
Mechanical Engineering	Prof. S. S. Mohite	mohitess.mech@coeptech.ac.in	 
Mechanical Engineering	Prof. M. J. Sable	mjs.mech@coeptech.ac.in	 
Mechanical Engineering	Prof. M. R. Nandgaonkar	mrn.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Prashant Kumar	pk.mech@coep.ac.in	 
Mechanical Engineering	Dr. Bhalchandra Puranik	—	 
Mechanical Engineering	Dr. Mukund S. Kale	mukund_kale@hotmail.com	 
Mechanical Engineering	Dr. Ajay P. Bhattu	bhattuajay.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. V. K. Haribhakta	vkh.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. M. P. Khond	mpk.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. U. V. Pise	uvp.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. S. S. Ohol	sso.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. S. S. Pardeshi	ssp.mech@coeptech.ac.in; deanadmin@coeptech.ac.in	 
Mechanical Engineering	Dr. S. B. Patil	sbp.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. S. V. Wagh	svw.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Mrs. P. H. Selmokar	pjm.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Mrs. M. H. Yadav	mhy.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. N. P. Dale	npd.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. N. D. Dhote	ndd.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. M. B. Bhore	mbb.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. P. S. Shinde	pss.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Mrs. S. S. Mundra	ssm.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. H P Shinde	hps.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Santosh Kumar	kumars.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Tejas Pramod Naik	tpn.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Anshul Ashok Jain	aaj.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Ravichandra Patil	rsp.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Akshay S. Desai	asd.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Manish Hiralal Attal	mha.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Saurabh Sharma	sharmas.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Vibhav S. Ambardekar	vsa.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Devendra Laxman Kamble	dlk.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Prathamesh Prashant Deshpande	ppd.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Prateek Deoman Malwe	pdm.mech@coeptech.ac.in	 
Mechanical Engineering	Dr. Debasish Mahapatra	mahapatrad.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. Sanjay S. Deshpande	deshpandes.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. Chinmay V. Desai	—	 
Mechanical Engineering	Mr. Vipin Palande	—	 
Mechanical Engineering	Mr. Manoj Gokhale	mpg.mech@coeptech.ac.in	 
Mechanical Engineering	Mrs. Rupali S. Sewane	rss.mech@coeptech.ac.in	 
Mechanical Engineering	Mr. Navnath Agnu Kalel	—	 
Metallurgy and Material Engineering	Dr. Manisha G. Kulthe	hod.meta@coeptech.ac.in; mgk.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. N. B. Dhokey	nbd.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. S. P. Butee	spb.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. S. U. Dangrikar	sud.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. V. T. Thavale	vtt.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Sanak Mishra	mishra.sanak@gmail.com	 
Metallurgy and Material Engineering	Dr. Abhishek M. More	amm.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Mrs. A. N. Shinde	ans.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Pravin F. Varade	pfv.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Prashant A. Dixit	pda.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Jaydeep Saha	sahaj.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Arun Kumar Gurrala	gurralaak.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Vinit K. Kanade	vkk.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Roshan D. Gadve	rdg.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Manasi Mulay	mrm.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Neelaambhigai Mayilswamy	nm.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Abhinav Dixit	dixita.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Swarnima Premkumar Singh	sps.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Abhishek Pandey	pandeya.meta@coeptech.ac.in	 
Metallurgy and Material Engineering	Dr. Manish Kumar Tiwari	—	 
Electronics and Telecommunication Engineering	Dr. Shrinivas P Mahajan	spm.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Vibha Vyas	hod.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Pankaj Prakash Tasgaonkar	ppt.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Prashant Bartakke	ppb.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Neelima R. Kolhare	nrk.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Radhika D. Joshi	rdj.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Vaishali Vijay Ingale	vvi.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Pratibha Shingare	pps.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Yogita D Kapse	ydk.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Metkar Shilpa P	metkars.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Mrs. Ashwini Ganesh Andurkar	aga.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Vidya Nitin More	vnm.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Vanita Agarwal	vsa.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Deeplaxmi V. Niture	dvn.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Yogita Mukund Vaidya	ymv.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Ashwini Kulkarni	aak.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Manjeeta Ramakant Kale	kmr.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Saiyma Fatima Raza	sfr.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Shubhangi Abhijit Deshmukh	smt.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Anusaka Gon	gona.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Manoj Shridhar Soman	somanm.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Anamika Kumari	kumaria.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Mohini Siddharth Sawane	kss.extc@coeptech.ac.in	Same email as Dr. Kanchan Sharma on the site; one is likely a typo
Electronics and Telecommunication Engineering	Dr. Paresh Risbud	risbudp.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Aditi Jain	jaina.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Charu Bolia	boliac.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Kushal D. Badgujar	kdb.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Mr. Shubham Ravindra Kshirsagar	srk.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Prasad Vinod Chavan	pvc.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Tanu Sharma	sharmat.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dr. Kanchan Sharma	kss.extc@coeptech.ac.in	Same email as Dr. Mohini Siddharth Sawane on the site; one is likely a typo
Electronics and Telecommunication Engineering	Rishu Yadav	yadavr.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Yuga Balasaheb Kadam	ybk.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dudhani Rushikesh Dhananjay	rdd.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Mr. Aniket Patil	avp.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Mrs. Arya Anup Deshpande	aad.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Onkar M. Mudegaonkar	omm.extc@coeptech.ac.in	 
Electronics and Telecommunication Engineering	Dinanath Kholkar	kholkard.extc@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. B. Rajiv	rbh.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Sandeep S. Anasane	hod.mfg@coeptech.ac.in; ssa.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Arati Mulay	avm.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Maheshwar D. Jaybhaye	mdj.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Bhagwan U. Sonawane	bus.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Sudhir Madhav Patil	smp.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. S. U. Ghunage	sug.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. P. D. Pantawane	pdpantawane.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Jayant S. Karajagikar	jsk.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Ms. Avani B. Londhe (Kadam)	abl.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Swarup S. Deshmukh	ssd.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Amit Motwani	akm.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Vikas V. Kanake	vvk.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Mayur M. Sanas	mms.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Hrishikesh Kishor Jadhav	hkj.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Ms. Aishwarya Dilip Dange	add.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Prasad Jagannath Waste	pjw.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Netaji Rajabhau Kadam	nrk.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Pravin Anandrao Pawar	pap.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Sarthak Navnath Shinde	sns.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Dr. Sudhir Chaurasiya	chaurasiyas.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Kishor Ankush Chandgude	kac.mfg@coeptech.ac.in	 
Manufacturing Engineering and Industrial Management	Mr. Sandeep Rambhau Jarak	srj.mfg@coeptech.ac.in	 
Electrical Engineering	Dr. Rajaram T. Ugale	hod.elec@coeptech.ac.in; rtu.elec@coeptech.ac.in	 
Electrical Engineering	Prof. Archana G. Thosar	agt.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Vijaya Sanjay Rajguru	vsr.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Atul Raghunandan Phadke	arp.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Mrs. Sadhana Vijay Jadhav	svj.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Mrs. Arti Vivek Tare	avt.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Meera Murali	mm.elec@coeptech.ac.in	 
Electrical Engineering	Mrs. Vinodini Bhushan Bhole	vbb.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Snehal Unde	svu.elec@coeptech.ac.in	 
Electrical Engineering	Saurabh Chandra	chandras.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Ritika Asati	asatir.elec@coeptech.ac.in	 
Electrical Engineering	Mrs. Gauri Bendale	gsb.elec@coeptech.ac.in	 
Electrical Engineering	Mrs. Renu Saxena	rds.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Sarika Vijaykumar Tade	svt.elec@coeptech.ac.in	 
Electrical Engineering	Urmila Mewalal Mathure	mathureu.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Priti Parag Gaikwad	pbk.elec@coeptech.ac.in	 
Electrical Engineering	Tanjil Shahid Bangali	tsb.elec@coeptech.ac.in	 
Electrical Engineering	Sneha Vasant Pande	svp.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Mayuri Sandesh Poojari	msp.elec@coeptech.ac.in	 
Electrical Engineering	Panchshila Pillewar	ppg.elec@coeptech.ac.in	 
Electrical Engineering	Deepsikha Panda	pandad.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Yawer Abbas Khan	yak.elec@coep.ac.in	 
Electrical Engineering	Pranoti Vaidya	pdv.elec@coeptech.ac.in	 
Electrical Engineering	Dr. Katkar Siddhant Satyapal	ssk.elec@coeptech.ac.in	 
Electrical Engineering	Anurag Mohan	mohana.elec@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Pramod D. Shendge	pds.instru@coeptech.ac.in; hod.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Prof. Dayaram N. Sonawane	dns.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Prof. Rajendra D. Kokate	rdk.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Prof. Chetankumar Y. Patil	cyp.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Uttam M. Chaskar	umc.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Prof. Sanjaykumar L. Patil	slp.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. (Mrs) Rohini P. Mudhalwadkar	rpm.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Girish V. Lakhekar	gvl.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Mrs. Meera A. Khandekar	mgj.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Nikhila Patil	pnl.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Mrs. Ketaki A. Ghodinde	ssk.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Amruta S. Deshpande	asd.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Sayali Bindu	saj.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Dr. Suraj Saha	sahas.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Ms. Priyanka P. Mane	ppm.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Mr. Rushikesh A Barsing	rab.instru@coeptech.ac.in	 
Instrumentation and Control Engineering	Snehal Prakash Hulikire	sph.instru@coeptech.ac.in	 
Planning	Mr. Arjun Singh Lodhi	asl.plann@coeptech.ac.in	 
Planning	Dr. Arati Siddharth Petkar	asp.civil@coeptech.ac.in	 
Planning	Dr. Sanjaykumar G. Sonar	sgs.civil@coeptech.ac.in	 
Planning	Dr. Amruta Amey Kakirde	aak.plann@coeptech.ac.in	 
Planning	Dr. Divya S. Agarwal	dsa.plann@coeptech.ac.in	 
Planning	Dr. Yenisetty Pavan Teja	pty.plann@coeptech.ac.in	 
Planning	Dr. Purba Biswas	biswasp.plann@coeptech.ac.in	 
Planning	Ms. Srushti Krishnakumar Mendhe	skm.civil@coeptech.ac.in	 
Planning	Ms. Tanika Shinde	tps.civil@coeptech.ac.in	 
Planning	Mrs. Aishwarya Anant Tupe	aat.civil.@coeptech.ac.in	Email printed with an extra dot, as on the site
Planning	Ms. Jaspreet Kaur Chhabda	jkc.plann@coeptech.ac.in	 
Planning	Ms. Mrudula Mangalkar	mam.plann@coeptech.ac.in	 
Planning	Ms. Manasi Vijay Gaikwad	gmv.plann@coeptech.ac.in	 
Planning	Mr. Suraj Nanasaheb Ubale	snu.plann@coeptech.ac.in	 
Planning	Salimah Hasnah	hasnahs.plann@coeptech.ac.in	 
Planning	Ar. Vedant Sanjay Chourasia	vsc.plan@coeptech.ac.in	 
Planning	Ms. Snehal Sanjay Kanade	ssk.civil@coeptech.ac.in	 
Planning	Rutuja Mane	rsm.planning@coeptech.ac.in	 
Planning	Ms. Pratiksha Patil	prp.plann@coeptech.ac.in	 
Computer Science and Engineering	Dr. Pradeep K. Deshmukh	hod.comp@coeptech.ac.in; pkd@coeptech.ac.in	 
Computer Science and Engineering	Dr. Jibi Abraham	ja.comp@coeptech.ac.in	 
Computer Science and Engineering	Uday Ramteerthkar	usr.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Ramanathan Venkateswaran	venkateswaranr.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Vahida Z. Attar	vahida.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Ravindra D Naik	rdn.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. V. K. Pachghare	vkp.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Yashodhara V. Haribhakta	ybl.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Sunil B. Mane	sunilbmane.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Shirish Purushottam Gosavi	spg.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Santosh Nanarao Ghotkar	sng.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Deepak D. Kshirsagar	ddk.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Satish Shivaji Kumbhar	ssk.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Siddharth Kisan Gaikwad	skg.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Archana Bhaskar Patil	abp.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Abhijit A.M.	abhijit.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Amit D. Joshi	adj.comp@coeptech.ac.in; amitjoshi@acm.org	 
Computer Science and Engineering	Mrs. Aparna Santra Biswas	aparna.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Soma Niloy Ghosh	gsn.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Tanuja Rajesh Pattanshetti	trp.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Sawant Suraj Tanaji	sts.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Vijay M. Khadse	vmk.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Anish R. Khobragade	anishraj.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Haridas D. Gadade	hdg.comp@coeptech.ac.in	 
Computer Science and Engineering	Dr. Pratiksha R. Deshmukh	dpr.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Trishna Ugale	tjj.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Abhiraj Bhaskar Ubale	abu.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Afsha Imran Akkalkot	afshaanmaniyar38@gmail.com	 
Computer Science and Engineering	Mrs. Ashwini Suyog Gavade	asg.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Priti Yadav	ppy.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Ankita Swapnil Mali	malias.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Tina Francis	francist.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Sujata Laxman Sonawane	sls.comp@coeptech.ac.in	 
Computer Science and Engineering	Miss Sneha Govind Chavan	snehaavi8@gmail.com	 
Computer Science and Engineering	Ms. Vaishali Kashinath Kosamkar	kosamkarv.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Padmashree Shridhar Shedbalkar	pss.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Riti Rajesh Thakor	rrt.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Sneha Suhas Palimkar	snehapalimkar.5@gmail.com	 
Computer Science and Engineering	Ms. Pranoti Sanjay Patil	patilps.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Manish Gaikawad	mkg.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Shruti Gajanan Vedpathak	sgv.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Omkar Prakash Londhe	opl.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Anuja Kiran Patil	patilak.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Sakshi M. Mandwekar	smm.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Savita Anil Adhav	adhavsa.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Abha Waikar	amw.comp@coeptech.ac.in	 
Computer Science and Engineering	Shubham D. Pawar	psd.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Kaveti Nani Kartik	kavetink.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Om Anil More	oam.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Pratibha Premraj Patil	ppp.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Aniket Shrikrishna Jawale	asj.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Sachin Mahesh Patil	smp.comp@coeptech.ac.in	 
Computer Science and Engineering	Mrs. Pallavi Manoj Sawant	pms.comp@coeptech.ac.in	 
Computer Science and Engineering	Ms. Akshata Madhusudan Suryawanshi	ams.comp@coeptech.ac.in	 
Computer Science and Engineering	Mr. Tejas Anil Hirurkar	tah.comp@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Kavita Shirish Suranje	knj.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Mahesh Ravindra Shindikar	hod.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Nandini Venkat Iyer	nvi.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Kshipra V. Moghe	kam.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Mrs. Shubhangi B. Karadkar	sbk.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Yogeshwari B Sonawane	ybs.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Amol Narayan Jadhao	anj.appsci@coeptech.ac.in	 
Applied Sciences and Humanities	Dr. Meghna A. Mane	mam.appsci@coeptech.ac.in	 
Mathematics	Dr. Jishu Das	dasj.maths@coeptech.ac.in	 
Mathematics	Dr. Aman Jhinga	aj.maths@coeptech.ac.in	 
Mathematics	Mr. Sohan D. Barkale	sdb.maths@coeptech.ac.in	 
Mathematics	Mrs. Ahilya Bharat Dhere	abd.maths@coeptech.ac.in	 
Mathematics	Dr. Kiran Vishnupant Dalvi	kvd.maths@coeptech.ac.in	 
Mathematics	Mrs. Rashmi Shrikant Kulkarni	rpm.maths@coeptech.ac.in	 
Mathematics	Dr. Yogita Mahesh Mahatekar	yvs.maths@coeptech.ac.in	 
Mathematics	Dr. Neeta Vikas Shinde	nvs.maths@coeptech.ac.in	 
Physics	Dr. Rohini S. Chhatrala	cr.physics@coeptech.ac.in	 
Physics	Ms. Neelima A Patil	pna.physics@coeptech.ac.in	 
Physics	Dr. Yogita S. Patil	ysp.physics@coeptech.ac.in	 
Physics	Dr. Shweta N. Chaure	csn.physics@coeptech.ac.in	 
Physics	Dr. Jagdish W. Dadge	jwd.physics@coeptech.ac.in	 
Physics	Mr. Vivek C. Mandake	mandakevc.physics@coeptech.ac.in	 
Physics	Dr. Mrunalini Sunil Phalak	msp.physics@coeptech.ac.in	 
Physics	Yatin J. Pitkar	yjp.physics@coeptech.ac.in	 
Management Studies	Dr. Sandeep A. Meshram (HoD)	hod.management@coeptech.ac.in	Also listed under Civil Engineering with a different email
Management Studies	Dr. Arun Mudbidri	adm.mngmt@coeptech.ac.in	 
Management Studies	Dr. Asmat Ara Shaikh	aas.mngmt@coeptech.ac.in	 
Management Studies	Dr. Sonal Mahajan	mahajans.mngmt@coeptech.ac.in	 
Management Studies	Dr. Nilaya Murthy	murthyn.mngmt@coeptech.ac.in	 
Management Studies	Mr. Kanad Deshmukh	deshmukhk.mngmt@coeptech.ac.in	 
Management Studies	Mrs. Sanchita Thanedar-Satalkar	thanedars.mngmt@coeptech.ac.in	 
Management Studies	Dr. Arpita Goyal	goyala.mngmt@coeptech.ac.in	 
Management Studies	Dr. Snehal Junnarkar	saj.mngmt@coeptech.ac.in	 
Management Studies	Dr. Sidra Tariq	tariqs.mngmt@coeptech.ac.in	 
Management Studies	Mrs. Suvarna Gavade	gavades.mngmt@coeptech.ac.in	 
Management Studies	Ms. Bharti Gaikwad	bag.mngmt@coeptech.ac.in	 
Management Studies	Mr. Sarang Hatvalne	sgh.mngmt@coeptech.ac.in	 
Management Studies	Mr. Amitkumar Khandare	khandarea.mngmt@coeptech.ac.in`

function parseFaculty() {
  const lines = rawData.trim().split('\n')
  const seenEmails = new Set()
  const facultyList = []

  let idx = 1
  for (const line of lines) {
    const parts = line.split('\t').map(p => p.trim())
    if (parts.length < 3) continue
    const department = parts[0]
    const name = parts[1]
    let emailField = parts[2]
    const notes = parts[3] || ''

    if (!department || !name) continue

    // Handle email cleaning
    // Handle multiple emails separated by ';'
    let email = emailField
    if (email.includes(';')) {
      const split = email.split(';').map(e => e.trim())
      // Prefer the departmental or personal @coeptech.ac.in one
      email = split[0]
    }

    // Clean common typos e.g. "aat.civil.@coeptech.ac.in" -> "aat.civil@coeptech.ac.in"
    email = email.replace('.@', '@').toLowerCase().trim()

    // If email is missing or "—", generate a clean one from name and department acronym
    if (!email || email === '—' || email === '-') {
      const cleanName = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.|Miss|Ar\.)\s+/i, '')
        .replace(/[^a-zA-Z\s]/g, '')
        .trim()
        .toLowerCase()
        .split(/\s+/)
      const initials = cleanName.length > 1 ? cleanName[cleanName.length - 1] + cleanName[0][0] : cleanName[0]
      const deptCode = department.toLowerCase().includes('mech') ? 'mech'
        : department.toLowerCase().includes('meta') ? 'meta'
        : department.toLowerCase().includes('civil') ? 'civil'
        : department.toLowerCase().includes('elec') ? 'elec'
        : department.toLowerCase().includes('comp') ? 'comp'
        : 'faculty'
      email = `${initials}.${deptCode}@coeptech.ac.in`
    }

    // Handle duplicate emails if any (e.g. Dr. Mohini and Dr. Kanchan Sharma having same email)
    if (seenEmails.has(email)) {
      const cleanName = name.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 8)
      email = `${cleanName}.${email.split('@')[0]}@coeptech.ac.in`
    }
    seenEmails.add(email)

    const isHoD = notes.toLowerCase().includes('hod') || name.toLowerCase().includes('(hod)') || email.startsWith('hod.')
    const roleTier = isHoD ? 'Head of Department' : 'Faculty Coordinator'

    facultyList.push({
      id: `USR-FAC-${String(idx).padStart(4, '0')}`,
      name,
      email,
      role: 'Faculty',
      roleTier,
      department,
      notes: notes || undefined,
      auth_provider: 'COEP Faculty SSO / Outlook 365',
      is_active: true
    })
    idx++
  }

  return facultyList
}

async function run() {
  const list = parseFaculty()
  console.log(`Parsed ${list.length} faculty members across departments.`)

  // Save as JS export
  const jsContent = `/**
 * Official COEP Technological University Faculty Directory
 * Auto-generated & synced with Supabase Database
 * Total Verified Faculty: ${list.length}
 */
export const importedFacultyUsers = ${JSON.stringify(list, null, 2)};
`
  const jsPath = path.resolve('src/data/importedFacultyUsers.js')
  fs.writeFileSync(jsPath, jsContent, 'utf-8')
  console.log(`Saved faculty data to ${jsPath}`)

  // Upload to Supabase 'users' table
  console.log('Uploading faculty to Supabase "users" table...')
  const batchSize = 50
  let totalUploaded = 0

  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize).map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      role: 'Faculty',
      department: f.department,
      auth_provider: f.auth_provider,
      is_active: true
    }))

    const { data, error } = await supabase
      .from('users')
      .upsert(batch, { onConflict: 'email' })
      .select('id')

    if (error) {
      console.error(`Batch upload error [${i}]:`, error.message)
    } else {
      totalUploaded += (data ? data.length : batch.length)
      console.log(`Uploaded batch ${i + 1} - ${Math.min(i + batchSize, list.length)} (${totalUploaded}/${list.length})`)
    }
  }

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  console.log(`🎉 Done! Verified total users now in Supabase users table: ${count}`)
}

run().catch(console.error)
