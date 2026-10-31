// import {View, Text, Button} from 'react-native'

// import React from 'react'

// import {Paths, File, Directory} from 'expo-file-system'    


// export default function ExpoFile() {

//     const handlefilePath = () => {
//         console.log(Paths.document);

//         const imageDir = new Directory(Paths.document, 'images');

//         console.log('Image Directory Path:', imageDir);

//         imageDir.create( {importent: true});

//         const thumbnail  = new File(imageDir, 'thumbnail.png');

//         console.log('Thumbnail File Path:', thumbnail);

//         thumbnail.create();

//         console.log('File created at:', thumbnail);

//     }

//   return (

//       <View style={{flex: 1, justifyContent: 'center', backgroundColor: '#fff', alignItems: 'center'}}>

//         <Text>Expo File System Example</Text>

//         <Button title="Get File Path" onPress={handlefilePath} />
      
//       </View>

//   )
// }




// import {View, Text, Button} from "react-native";

// import {Paths, File, Directory} from "expo-file-system";

// import { useState } from "react";

// export default function FileSystem() {
//   const handlefileSystem = async() => {

//     if(!fileData.exists){
//       fileData.create();
//     }

//     const student= {
//       name:"Rohit",
//       age:39,
//       course:"React-native",
//     };

//     const jsonData = JSON.stringify(student);

//     fileData.write(jsonData);

//     const res = await fileData.text();

//     const data = JSON.parse(res);

//     console.log(data);

//   };

//   const [data ,setData] = useState("");

//   const fileDir = new Directory(Paths.document, "directory");

//   const newFile = new File(fileDir, "file.txt");

//   const handleReadFile = ()=>{
//     if(!fileDir.exists){
//       fileDir.create({
//         idempotent: true,
//         intermediates: true,
//       });
//     }

//     if(!newFile.exists) {
//       newFile.create();
//     }

//     newFile.write("Hey!");
//   };

//   const handleGetData = async () => {
//     if(!newFile.exists){

//     }
//   }

//   return (
//     <View style={{flex:1,justifyContent:"center", backgroundColor:"gray"}}>
//       <Text>Expo file system</Text>
//       <Button title="get file data" onPress={handlefileSystem}/>

//       <View style = {{height:100}}/>

//       <Button title="Read Data" onPress={handleReadFile}/>

//     </View>
//   )
// }







import * as FileSystem from "expo-file-system";
import { Button, Text, View } from "react-native";

export default function FileSystem() {
  const [progress, setProgress] = useState(0);
  const handleDownload = async () => {
    try {
      const url = "https://pixabay.com/videos/download/video-276047_medium.mp4";
      const destination = new Directory(Paths.cache, "download");

      destination.create({
        idempotent: true,
        intermediates: true,
      });

      const res = await File.downloadFileAsync(url, destination, {
        onProgress: ({  }) => {
          
        }
      });

      const handlePause = () => {
        File.pauseDownload(res.downloadId);
      };
      
      const handleResume = () => {
        File.resumeDownload(res.downloadId);
      };  

      console.log("Download completed:", res);

      console.log(res.uri);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <View>
      <Text>React Native Expo File System Class</Text>

      <Button title="Download File" onPress={handleDownload} />

      <Button title="Pause" onPress={handlePause}/>
      <Button title="Resume" onPress={handleResume}/>

    </View>
  );
}