export const apiResponse = (data) => {
    //  (`user data : ${data}`);
    return {
            data : data.data,
            message : data.message,
            statusCode : data.statusCode,
            success : data.success
    }
}
