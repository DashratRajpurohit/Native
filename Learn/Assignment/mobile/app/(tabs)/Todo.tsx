
// import React from 'react';
// import { View, Text, FlatList, Image, TextInput, ScrollView } from 'react-native';

// export default function Todo() {
//   const [data, setData] = React.useState<any[]>([]);
//   const [search, setSearch] = React.useState('');

//   React.useEffect(() => {
//     fetch('https://fakestoreapi.com/products')
//       .then((response) => response.json())
//       .then((json) => setData(json))
//       .catch((error) => console.error(error));
//   }, []);

//   const filteredData = data.filter((item: any) =>
//     item.title.toLowerCase().includes(search.toLowerCase())
//   );

//   const renderItem = ({ item }: { item: any }) =>
//     React.createElement(
//       View,
//       { key: item.id.toString(), style: { marginBottom: 16 } },
//       React.createElement(Text, null, item.title),
//       React.createElement(Image, {
//         source: { uri: item.image },
//         style: { width: 150, height: 150, marginTop: 8 },
//       })
//     );

//   return React.createElement(
//     ScrollView,
//     { contentContainerStyle: { padding: 20 } },
//     React.createElement(Text, null, 'Fetch Data'),
//     React.createElement(TextInput, {
//       placeholder: 'Search product...',
//       value: search,
//       onChangeText: setSearch,
//       style: {
//         borderWidth: 1,
//         padding: 10,
//         margin: 10,
//       },
//     }),
//     React.createElement(FlatList, {
//       data: filteredData,
//       keyExtractor: (item: any) => item.id.toString(),
//       renderItem,
//       scrollEnabled: false,
//     })
//   );
// }


import { Color } from 'expo-router';
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TextInput} from "react-native";


export default function Todo() {

  const [ products, setProducts ] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(()=>{
    fetch("https://dummyjson.com/products")
      .then((res) => res.json())
      .then((data)=> setProducts(data.products));
  },[]);

  const filteredProducts = products.filter((item)=>
  item.title.toLowerCase().includes(search.toLocaleLowerCase()));

  return (
    <View>

      <TextInput style ={{backgroundColor:"grey", padding:10, color:"blue"}}
        placeholder='Search Title'
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item})=>(
          <Text>
            {item.title} - ${item.price}
          </Text>
        )}
        />

    </View>
  )
}
