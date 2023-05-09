    // const fitleredProducts = products.filter((product) => {

    //     if (name && !product.name.includes(name))
    //         return false;
    //     if (price) {
    //         const { gt, lt, eq } = price;
    //         product.price = parseFloat(product.price)
    //         if (gt && product.price <= parseFloat(gt))
    //             return false;
    //         else if (lt && product.price >= parseFloat(lt))
    //             return false;
    //         else if (eq && product.price != parseFloat(eq))
    //             return false;
    //     }
    //     if (quantity) {
    //         const { gt, lt, eq } = quantity;
    //         if (gt && product.quantity <= parseFloat(gt))
    //             return false;
    //         else if (lt && product.quantity >= parseFloat(lt))
    //             return false;
    //         else if (eq && product.quantity != parseFloat(eq))
    //             return false;
    //     }
    //     return true;
    // })


    // const filter2 = (orders, { createdAt, totalPrice, productsId, productsPrice, productsQuantity }) => {
    //     productsId = productsId.split(',').map(id => parseInt(id));
    //     const fitleredOrders = orders.filter((order) => {
    //         if (createdAt) {
    //             const { gt, lt, eq, bt } = createdAt;
    //             if (gt && order.createdAt <= new Date(gt))
    //                 return false;
    //             else if (lt && order.createdAt >= new Date(lt))
    //                 return false;
    //             else if (eq && order.createdAt != new Date(eq))
    //                 return false;
    //             else if (bt) {
    //                 dts = bt.split(',').map(dt => new Date(dt))
    //                 if (order.createdAt > dts[1])
    //                     return false;
    //                 if (order.createdAt < dts[0])
    //                     return false;
    //             }
    //         }
    //         if (totalPrice) {
    //             const { gt, lt, eq } = totalPrice;
    //             order.totalPrice = parseFloat(order.totalPrice)
    //             if (gt && order.totalPrice <= parseFloat(gt))
    //                 return false;
    //             else if (lt && order.totalPrice >= parseFloat(lt))
    //                 return false;
    //             else if (eq && order.totalPrice != parseFloat(eq))
    //                 return false;
    //         }
    //         const products = [...order.productDetails]
    //         const fitleredProds = products.filter(({ productId: id, price, quantity }) => {
    //             if (productsId && !productsId.includes(id)) {
    //                 return false;
    //             }
    //             if (productsPrice) {
    //                 const { gt, lt, eq } = productsPrice;
    //                 if (gt && price <= parseFloat(gt))
    //                     return false;
    //                 else if (lt && price >= parseFloat(lt))
    //                     return false;
    //                 else if (eq && price != parseFloat(eq))
    //                     return false;
    //             }
    //             if (productsQuantity) {
    //                 const { gt, lt, eq } = productsQuantity;
    //                 if (gt && quantity <= parseFloat(gt))
    //                     return false;
    //                 else if (lt && quantity >= parseFloat(lt))
    //                     return false;
    //                 else if (eq && quantity != parseFloat(eq))
    //                     return false;
    //             }
    //             return true;
    //         })
    //         if (fitleredProds.length === 0)
    //             return false
    //         return true;
    //     })
    //     return fitleredOrders
    // }