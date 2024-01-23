export const safeJsonParse = <T>(str: string) => {
    try {
        const jsonValue: T = JSON.parse(str);

        return jsonValue;
    } catch {
        return undefined;
    }
};
export const safeGetConstructFileJson = <T>(runtime: IRuntime, fileName: string) : Promise<T> =>{
	return new Promise((resolve, reject) =>
        runtime.assets
            .getProjectFileUrl(fileName)
            .then((filepath) =>
                fetch(filepath)
                    .then((response) =>
                        response
                            .text()
                            .then((rawJSON) => {
                                const result = safeJsonParse<T>(rawJSON);
                                result !== undefined
                                    ? resolve(result)
                                    : reject(`Unable to parse to ${fileName} : + ${rawJSON}`);
                            })
                            .catch((reason) => reject(`Unable to fetch Datafile ${reason}`))
                    )
                    .catch((reason) => `Unable to FIND data file - ${reason}`)
            )
            .catch((reason) => `the install fucked up, cant find SaveData.json - ${reason}`)
    );
}

