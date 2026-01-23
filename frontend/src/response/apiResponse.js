export const apiResponse = (data) => {
    console.log(`user data : ${data}`);
    return {
            data : data.data,
            message : data.message,
            statusCode : data.statusCode,
            success : data.success
    }
}
