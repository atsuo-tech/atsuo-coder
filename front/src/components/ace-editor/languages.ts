const languages = {

	"cpp23": "c_cpp",
	"python2": "python",
	"python3": "python",
	"nasm": "assembly_x86",

} as const;

export default languages as { [key: string]: (typeof languages)[keyof typeof languages] };
